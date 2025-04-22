import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SolarService, SolarData } from '../services/solar.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.service';
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('powerProductionChart') powerProductionChart!: ElementRef;
  @ViewChild('powerConsumptionChart') powerConsumptionChart!: ElementRef;

  solarData: SolarData[] = [];
  private updateSubscription?: Subscription;
  isLoading = true;
  error: string | null = null;
  activeTab: 'flow' | 'details' | 'charts' = 'flow'; // Varsayılan olarak enerji akışı sekmesi aktif
  productionChart: any;
  consumptionChart: any;
  isAdminView: boolean = false;
  isInstallerView: boolean = false;
  originalAdminUser: any = null;
  originalInstallerUser: any = null;

  constructor(
    private solarService: SolarService,
    private authService: AuthService,
    private router: Router
  ) {
    // Local storage'dan orijinal admin bilgilerini kontrol et
    const adminUserStr = localStorage.getItem('adminUser');
    if (adminUserStr) {
      this.originalAdminUser = JSON.parse(adminUserStr);
      this.isAdminView = true;
    }

    // Local storage'dan orijinal installer bilgilerini kontrol et
    const installerUserStr = localStorage.getItem('installerUser');
    if (installerUserStr) {
      this.originalInstallerUser = JSON.parse(installerUserStr);
      this.isInstallerView = true;
    }
  }

  ngOnInit() {
    this.getSolarData();
    // Her 30 saniyede bir güncelle
    this.updateSubscription = interval(30000).subscribe(() => {
      this.getSolarData();
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  getSolarData() {
    this.isLoading = true;
    this.error = null;

    this.solarService.getSolarData().subscribe({
      next: (data) => {
        this.solarData = this.sortDataByDate(data);
        this.isLoading = false;
        this.initCharts();
      },
      error: (error) => {
        console.error('Veri çekme hatası:', error);
        this.error = 'Veriler yüklenirken bir hata oluştu.';
        this.isLoading = false;
      }
    });
  }

  // Sekme değiştirme metodu
  setActiveTab(tab: 'flow' | 'details' | 'charts') {
    this.activeTab = tab;
    if (tab === 'charts') {
      setTimeout(() => {
        this.initCharts();
      }, 100);
    }
  }

  // Yardımcı metodlar
  getBatteryClass(): string {
    const charge = this.getCurrentData()?.akuSarjDurumu ?? 0;
    if (charge < 30) return 'battery-low';
    if (charge < 70) return 'battery-medium';
    return 'battery-high';
  }

  getStrokeDashoffset(): number {
    const charge = this.getCurrentData()?.akuSarjDurumu ?? 0;
    return 87.96 - (87.96 * charge / 100);
  }

  getCurrentData(): SolarData | null {
    return this.solarData && this.solarData.length > 0 ? this.solarData[0] : null;
  }

  private sortDataByDate(data: SolarData[]): SolarData[] {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // En yeni tarih en üstte
    });
  }

  initCharts() {
    if (this.powerProductionChart && this.powerConsumptionChart) {
      const timestamps = this.solarData.map(item => new Date(item.created_at).toLocaleTimeString());
      const productionData = this.solarData.map(item => item.anlikGucUretimi);
      const consumptionData = this.solarData.map(item => item.anlikEnerjiTuketimi);

      // Güç Üretimi Grafiği
      this.productionChart = new Chart(this.powerProductionChart.nativeElement, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'Güç Üretimi (W)',
            data: productionData,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Watt (W)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Zaman'
              }
            }
          }
        }
      });

      // Güç Tüketimi Grafiği
      this.consumptionChart = new Chart(this.powerConsumptionChart.nativeElement, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'Güç Tüketimi (W)',
            data: consumptionData,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Watt (W)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Zaman'
              }
            }
          }
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  returnToAdmin() {
    if (this.authService.returnToAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  returnToInstaller() {
    if (this.authService.returnToInstaller()) {
      this.router.navigate(['/installer']);
    }
  }
}

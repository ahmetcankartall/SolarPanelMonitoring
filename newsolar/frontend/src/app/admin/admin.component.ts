import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User, UpdateUserData } from '../services/auth.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  currentUser: any;
  users: User[] = [];
  filteredUsers: User[] = [];
  showAddUserModal = false;
  showEditUserModal = false;
  addUserForm: FormGroup;
  editUserForm: FormGroup;
  selectedUser: User | null = null;
  isLoading = false;
  error: string | null = null;
  activeMenu = 'users'; // Varsayılan olarak tüm kullanıcıları göster

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.currentUser = this.authService.currentUser;
    this.addUserForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', [Validators.required]]
    });

    this.editUserForm = this.fb.group({
      username: ['', [Validators.required]],
      password: [''],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Kullanıcı yönetimi metodları
  loadUsers() {
    this.isLoading = true;
    this.error = null;
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Kullanıcılar yüklenirken bir hata oluştu';
        this.isLoading = false;
      }
    });
  }

  // Kullanıcıları role göre filtrele
  filterUsers() {
    switch(this.activeMenu) {
      case 'users':
        this.filteredUsers = this.users.filter(user => user.role === 'user');
        break;
      case 'admins':
        this.filteredUsers = this.users.filter(user => user.role === 'admin');
        break;
      case 'installers':
        this.filteredUsers = this.users.filter(user => user.role === 'installer');
        break;
      default:
        this.filteredUsers = [...this.users];
    }
  }

  // Sol menüden seçilen kullanıcı tipini ayarla
  setActiveMenu(menuType: string) {
    this.activeMenu = menuType;
    this.filterUsers();
  }

  openAddUserModal() {
    this.showAddUserModal = true;
    this.addUserForm.reset({ role: 'user' });
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.addUserForm.reset();
  }

  submitAddUserForm() {
    if (this.addUserForm.valid) {
      this.isLoading = true;
      this.error = null;

      this.authService.addUser(this.addUserForm.value).subscribe({
        next: () => {
          this.loadUsers();
          this.closeAddUserModal();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error.message || 'Kullanıcı eklenirken bir hata oluştu';
          this.isLoading = false;
        }
      });
    }
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      username: user.username,
      role: user.role,
      password: ''
    });
    this.showEditUserModal = true;
  }

  closeEditUserModal() {
    this.showEditUserModal = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  submitEditUserForm() {
    if (this.editUserForm.valid && this.selectedUser) {
      this.isLoading = true;
      this.error = null;

      const userData: UpdateUserData = {
        username: this.editUserForm.value.username,
        role: this.editUserForm.value.role
      };

      // Şifre sadece değiştirilmek isteniyorsa ekle
      if (this.editUserForm.value.password) {
        userData.password = this.editUserForm.value.password;
      }

      this.authService.updateUser(this.selectedUser._id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeEditUserModal();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error.message || 'Kullanıcı güncellenirken bir hata oluştu';
          this.isLoading = false;
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`${user.username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      this.isLoading = true;
      this.error = null;

      this.authService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error.message || 'Kullanıcı silinirken bir hata oluştu';
          this.isLoading = false;
        }
      });
    }
  }

  viewUserHome(user: User) {
    // AuthService üzerinden kullanıcı görünümüne geç
    this.authService.setViewAsUser(user);

    // Home sayfasına yönlendir
    this.router.navigate(['/home']);
  }

  // Kullanıcı rol adını Türkçe olarak göster
  getLocalizedRole(role: string): string {
    switch(role) {
      case 'admin': return 'Admin';
      case 'user': return 'Kullanıcı';
      case 'installer': return 'Installer';
      default: return role;
    }
  }

  // Kullanıcı rolüne göre ana başlığı belirle
  getActiveMenuTitle(): string {
    switch(this.activeMenu) {
      case 'users': return 'Kullanıcı Yönetimi';
      case 'admins': return 'Admin Yönetimi';
      case 'installers': return 'Installer Yönetimi';
      default: return 'Kullanıcı Yönetimi';
    }
  }
}

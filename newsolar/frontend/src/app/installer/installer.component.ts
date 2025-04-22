import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-installer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './installer.component.html',
  styleUrls: ['./installer.component.css']
})
export class InstallerComponent implements OnInit {
  currentUser: any;
  users: User[] = [];
  filteredUsers: User[] = [];
  showAddUserModal = false;
  showEditUserModal = false;
  addUserForm: FormGroup;
  editUserForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  selectedUser: User | null = null;

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
      password: ['', [Validators.minLength(6)]],
      role: ['user', [Validators.required]]
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
        this.filteredUsers = this.users.filter(user => user.role === 'user');
        this.isLoading = false;
      },
      error: (err) => {
        // Admin yetkisi hatası gelirse bu hatayı gösterme ama kullanıcı ekleme işlemini engelleme
        if (err.error && err.error.message === 'Admin yetkisi gerekli') {
          this.isLoading = false;
          // Kullanıcı listesi boş olsun ama kullanıcı ekleme işlemi çalışsın
          this.users = [];
          this.filteredUsers = [];
        } else {
          this.error = err.error.message || 'Kullanıcılar yüklenirken bir hata oluştu';
          this.isLoading = false;
        }
      }
    });
  }

  openAddUserModal() {
    this.showAddUserModal = true;
    this.addUserForm.reset({ role: 'user' });
    this.successMessage = null;
    this.error = null;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.addUserForm.reset();
    this.successMessage = null;
    this.error = null;
  }

  submitAddUserForm() {
    if (this.addUserForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      // Installer'ların sadece user rolünde kullanıcı eklemesine izin veriyoruz
      const userData = {
        ...this.addUserForm.value,
        role: 'user'
      };

      this.authService.addUser(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.successMessage = 'Kullanıcı başarıyla eklendi.';
          this.addUserForm.reset({ role: 'user' });
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error.message || 'Kullanıcı eklenirken bir hata oluştu';
          this.isLoading = false;
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addUserForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Kullanıcı işlemleri
  viewUserHome(user: User) {
    // Installer olarak giriş yapan kullanıcının bilgilerini saklayıp, kullanıcı görünümüne geç
    this.authService.setViewAsUser(user);
    // Ana sayfaya yönlendir
    this.router.navigate(['/home']);
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.showEditUserModal = true;
    this.editUserForm.patchValue({
      username: user.username,
      password: '',
      role: 'user'
    });
    this.successMessage = null;
    this.error = null;
  }

  closeEditUserModal() {
    this.showEditUserModal = false;
    this.editUserForm.reset();
    this.selectedUser = null;
    this.successMessage = null;
    this.error = null;
  }

  submitEditUserForm() {
    if (this.editUserForm.valid && this.selectedUser) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      // Sadece kullanıcı adını ve şifreyi güncelleme
      const userData: any = {
        username: this.editUserForm.value.username,
        role: 'user'
      };

      // Şifre sadece girilmişse gönder
      if (this.editUserForm.value.password) {
        userData.password = this.editUserForm.value.password;
      }

      this.authService.updateUser(this.selectedUser._id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.successMessage = 'Kullanıcı başarıyla güncellendi.';
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
      this.successMessage = null;

      this.authService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers();
          this.successMessage = 'Kullanıcı başarıyla silindi.';
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error.message || 'Kullanıcı silinirken bir hata oluştu';
          this.isLoading = false;
        }
      });
    }
  }
}

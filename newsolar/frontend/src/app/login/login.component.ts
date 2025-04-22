import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  loginError: string | null = null;
  loginType: 'admin' | 'user' | 'installer' = 'user'; // Varsayılan olarak kullanıcı girişi

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  setLoginType(type: 'admin' | 'user' | 'installer') {
    this.loginType = type;
    this.loginForm.patchValue({ username: '', password: '' });
    this.loginError = null;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = null;

      const { username, password, rememberMe } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (user) => {
          // Kullanıcı rolü ile seçilen giriş tipi uyuşuyor mu kontrol et
          if (user.role !== this.loginType) {
            this.loginError = `Bu hesap ${this.loginType === 'admin' ? 'admin' : this.loginType === 'installer' ? 'installer' : 'kullanıcı'} hesabı değil`;
            this.isLoading = false;
            return;
          }

          if (rememberMe) {
            localStorage.setItem('isLoggedIn', 'true');
          } else {
            sessionStorage.setItem('isLoggedIn', 'true');
          }
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (user.role === 'installer') {
            this.router.navigate(['/installer']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          this.loginError = error.error.message || 'Giriş başarısız';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

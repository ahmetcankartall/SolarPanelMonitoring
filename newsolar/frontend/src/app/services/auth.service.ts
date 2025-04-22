import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface User {
  _id: string;
  username: string;
  role: string;
  token?: string;
  createdAt?: Date;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  private originalAdminUser: User | null = null;
  private originalInstallerUser: User | null = null;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    const storedAdminUser = localStorage.getItem('adminUser');
    const storedInstallerUser = localStorage.getItem('installerUser');

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );

    if (storedAdminUser) {
      this.originalAdminUser = JSON.parse(storedAdminUser);
    }

    if (storedInstallerUser) {
      this.originalInstallerUser = JSON.parse(storedInstallerUser);
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.originalAdminUser !== null || this.currentUser?.role === 'admin';
  }

  public get isInstaller(): boolean {
    return this.originalInstallerUser !== null || this.currentUser?.role === 'installer';
  }

  setViewAsUser(user: User) {
    if (this.currentUser?.role === 'admin') {
      // Orijinal admin bilgilerini sakla
      this.originalAdminUser = this.currentUser;
      localStorage.setItem('adminUser', JSON.stringify(this.originalAdminUser));

      // Görüntülenecek kullanıcı bilgilerini ayarla
      const viewUser = {
        ...user,
        token: this.originalAdminUser.token // Admin token'ını kullan
      };
      localStorage.setItem('user', JSON.stringify(viewUser));
      this.currentUserSubject.next(viewUser);
    } else if (this.currentUser?.role === 'installer') {
      // Orijinal installer bilgilerini sakla
      this.originalInstallerUser = this.currentUser;
      localStorage.setItem('installerUser', JSON.stringify(this.originalInstallerUser));

      // Görüntülenecek kullanıcı bilgilerini ayarla
      const viewUser = {
        ...user,
        token: this.originalInstallerUser.token // Installer token'ını kullan
      };
      localStorage.setItem('user', JSON.stringify(viewUser));
      this.currentUserSubject.next(viewUser);
    }
  }

  returnToAdmin() {
    if (this.originalAdminUser) {
      localStorage.setItem('user', JSON.stringify(this.originalAdminUser));
      localStorage.removeItem('adminUser');
      this.currentUserSubject.next(this.originalAdminUser);
      this.originalAdminUser = null;
      return true;
    }
    return false;
  }

  returnToInstaller() {
    if (this.originalInstallerUser) {
      localStorage.setItem('user', JSON.stringify(this.originalInstallerUser));
      localStorage.removeItem('installerUser');
      this.currentUserSubject.next(this.originalInstallerUser);
      this.originalInstallerUser = null;
      return true;
    }
    return false;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { username, password });
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('installerUser');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
    this.currentUserSubject.next(null);
    this.originalAdminUser = null;
    this.originalInstallerUser = null;
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  getToken(): string | null {
    const user = this.currentUser;
    return user?.token || null;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  addUser(userData: { username: string; password: string; role: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(userId: string, userData: UpdateUserData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData);
  }

  createTempAccessToken(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/temp-access`, { userId });
  }
}

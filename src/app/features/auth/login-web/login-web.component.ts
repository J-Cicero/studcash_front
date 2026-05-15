import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-web',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-web.component.html',
  styleUrl: './login-web.component.scss'
})
export class LoginWebComponent implements OnInit {
  loginData = {
    email: 'admin@studcash.ul',
    password: 'password123'
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Si on passe ?skip=true sur /login, on saute l'écran de connexion (pour le dev)
    const skip = this.route.snapshot.queryParamMap.get('skip');
    if (skip === 'true') {
      this.router.navigate(['/ul/dashboard']);
    }
  }

  onLogin() {
    console.log('Tentative de connexion...', this.loginData);
    // Logique de redirection vers le dashboard après validation
    this.router.navigate(['/ul/dashboard']);
  }
}

import { HttpClient, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { AppError } from '../errors/app-error';
import { ERROR_MESSAGES } from '../errors/http-error.mapper';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('convierte los errores HTTP en AppError', () => {
    let received: unknown;
    http.get('/bp/products/x').subscribe({ error: (error) => (received = error) });

    httpMock
      .expectOne('/bp/products/x')
      .flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(received).toBeInstanceOf(AppError);
    expect((received as AppError).message).toBe(ERROR_MESSAGES.notFound);
  });

  it('deja pasar las respuestas exitosas sin modificarlas', () => {
    let received: unknown;
    http.get('/bp/products').subscribe((body) => (received = body));

    httpMock.expectOne('/bp/products').flush({ data: [] });

    expect(received).toEqual({ data: [] });
  });

  it('traduce la falta de conexión (status 0) a un error de red', () => {
    let received: unknown;
    http.get('/bp/products').subscribe({ error: (error) => (received = error) });

    httpMock.expectOne('/bp/products').error(new ProgressEvent('error'));

    expect((received as AppError).kind).toBe('network');
  });

  it('propaga sin cambios los errores que no son HTTP', () => {
    const original = new Error('fallo local');
    let received: unknown;

    TestBed.runInInjectionContext(() =>
      httpErrorInterceptor(new HttpRequest('GET', '/bp/products'), () =>
        throwError(() => original),
      ).subscribe({ error: (error) => (received = error) }),
    );

    expect(received).toBe(original);
  });
});

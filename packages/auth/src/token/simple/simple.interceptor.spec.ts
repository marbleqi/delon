import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DefaultUrlSerializer, Router, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';

import { AlainAuthConfig, provideAlainConfig } from '@delon/util/config';

import { provideAuth } from '../../provide';
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '../interface';
import { authSimpleInterceptor } from './simple.interceptor';
import { SimpleTokenModel } from './simple.model';

function genModel(token: string = `123`): SimpleTokenModel {
  const model = new SimpleTokenModel();
  model.token = token;
  model.uid = 1;
  return model;
}

class MockTokenService implements ITokenService {
  [key: string]: any;
  _data: any;
  options: any;
  refresh!: Observable<ITokenModel>;
  set(data: ITokenModel): boolean {
    this._data = data;
    return true;
  }
  get(): ITokenModel {
    return this._data;
  }
  change(): any {
    return null;
  }
  clear(): void {
    this._data = null;
  }
  readonly login_url = '/login';
}

describe('auth: simple.interceptor', () => {
  let http: HttpClient;
  let httpBed: HttpTestingController;
  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    parseUrl: jasmine.createSpy('parseUrl').and.callFake((value: any) => {
      return new DefaultUrlSerializer().parse(value);
    })
  };

  function genModule(options: AlainAuthConfig, tokenData?: SimpleTokenModel): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authSimpleInterceptor])),
        provideHttpClientTesting(),
        provideAlainConfig({ auth: options }),
        { provide: Router, useValue: mockRouter },
        provideAuth(),
        { provide: DA_SERVICE_TOKEN, useClass: MockTokenService }
      ]
    });
    if (tokenData) TestBed.inject(DA_SERVICE_TOKEN).set(tokenData);

    http = TestBed.inject<HttpClient>(HttpClient);
    httpBed = TestBed.inject(HttpTestingController as Type<HttpTestingController>);
  }

  describe('[token position]', () => {
    it(`in headers`, (done: () => void) => {
      const basicModel = genModel();
      genModule({}, basicModel);
      http.get('/test', { responseType: 'text' }).subscribe(() => {
        done();
      });
      const req = httpBed.expectOne('/test') as TestRequest;
      expect(req.request.headers.get('token')).toBe(basicModel.token!);
      req.flush('ok!');
    });
    it(`in body`, (done: () => void) => {
      genModule(
        {
          token_send_place: 'body'
        },
        genModel('123')
      );
      http.get('/test', { responseType: 'text' }).subscribe(() => {
        done();
      });
      const req = httpBed.expectOne('/test') as TestRequest;
      expect(req.request.body.token).toBe('123');
      req.flush('ok!');
    });
    it(`in url`, (done: () => void) => {
      genModule(
        {
          token_send_place: 'url'
        },
        genModel('123')
      );
      http.get('/test', { responseType: 'text' }).subscribe(() => {
        done();
      });
      const req = httpBed.expectOne(() => true) as TestRequest;
      expect(req.request.params.has('token')).toBe(true);
      expect(req.request.params.get('token')).toBe('123');
      req.flush('ok!');
    });
    it(`in url via full-domain`, (done: () => void) => {
      genModule(
        {
          token_send_place: 'url'
        },
        genModel('123')
      );
      http.get('https://ng-alain.com/test', { responseType: 'text' }).subscribe(() => {
        done();
      });
      const req = httpBed.expectOne(() => true) as TestRequest;
      expect(req.request.params.has('token')).toBe(true);
      expect(req.request.params.get('token')).toBe('123');
      req.flush('ok!');
    });
  });

  describe('[token template]', () => {
    const basicModel = genModel();

    it('should be [Bearer ${token}]', (done: () => void) => {
      genModule(
        {
          token_send_place: 'header',
          token_send_key: 'Authorization',
          token_send_template: 'Bearer ${token}'
        },
        basicModel
      );

      http.get('/test', { responseType: 'text' }).subscribe(() => {
        done();
      });
      const ret = httpBed.expectOne(r => r.method === 'GET' && (r.url as string).startsWith('/test')) as TestRequest;
      expect(ret.request.headers.get('Authorization')).toBe(`Bearer ${basicModel.token}`);
      ret.flush('ok!');
    });

    it('should be [Bearer ${uid}-${token}]', (done: () => void) => {
      genModule(
        {
          token_send_place: 'header',
          token_send_key: 'Authorization',
          token_send_template: 'Bearer ${uid}-${token}'
        },
        basicModel
      );

      http.get('/test', { responseType: 'text' }).subscribe(() => {
        done();
      });
      const ret = httpBed.expectOne(r => r.method === 'GET' && (r.url as string).startsWith('/test')) as TestRequest;
      expect(ret.request.headers.get('Authorization')).toBe(`Bearer ${basicModel.uid}-${basicModel.token}`);
      ret.flush('ok!');
    });
  });
});

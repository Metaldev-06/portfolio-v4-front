import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '@src/environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';
import { PostData } from '../../interfaces/post-data/post-data';
import { CourseData } from '../../interfaces/course-data/course-data';
import { i18nService } from '../transloco/i18n.service';
import { Locale } from '../../interfaces/project-data/project-data';

@Injectable({
  providedIn: 'root',
})
export class BlogDataService {
  private readonly apiUrl = environment.apiUrl;

  private blogData: BehaviorSubject<PostData> = new BehaviorSubject(
    {} as PostData,
  );
  private latestPostData: BehaviorSubject<PostData> = new BehaviorSubject(
    {} as PostData,
  );

  private selectedLanguage = signal<string>('');

  public blogData$ = this.blogData.asObservable();
  public latestPostData$ = this.latestPostData.asObservable();

  private readonly http = inject(HttpClient);
  private readonly i18nService = inject(i18nService);

  constructor() {
    const blogDataStorage = sessionStorage.getItem('blogData');
    const latestPostsStorage = sessionStorage.getItem('latestPost');

    if (blogDataStorage) {
      this.blogData.next(JSON.parse(blogDataStorage));
    }

    if (latestPostsStorage) {
      this.latestPostData.next(JSON.parse(latestPostsStorage));
    }

    const language = this.i18nService.getCurrentLanguage();
    if (language === 'es') {
      this.selectedLanguage.set('es-AR');
    } else {
      this.selectedLanguage.set(language);
    }
  }

  setBlogData(data: PostData) {
    sessionStorage.setItem('blogData', JSON.stringify(data));
    this.blogData.next(data);
  }

  clearBlogData() {
    sessionStorage.removeItem('blogData');
  }

  setLatestPostData(data: PostData) {
    sessionStorage.setItem('latestPost', JSON.stringify(data));
    this.latestPostData.next(data);
  }

  clearLatestPostData() {
    sessionStorage.removeItem('latestPost');
  }

  // private getCommonParams(): HttpParams {
  //   return (
  //     new HttpParams()
  //       .set('fields[0]', 'title')
  //       .set('fields[1]', 'slug')
  //       .set('fields[2]', 'description')
  //       .set('fields[3]', 'technology')
  //       .set('fields[4]', 'publishedAt')
  //       // .set('populate[image][fields][5]', 'formats')
  //       .set('populate', 'image')
  //   );
  // }

  getPosts(page = 1, locale: string): Observable<PostData> {
    if (locale === 'es') {
      locale = 'es-AR';
    }

    let params = new HttpParams()
      .set('sort', 'publishedAt:desc')
      .set('pagination[pageSize]', '8')
      .set('pagination[page]', page)
      .set('populate', '*')
      .set('locale', locale || this.selectedLanguage());

    return this.http.get<PostData>(`${this.apiUrl}/posts`, { params });
  }

  getPostBySlug(slug: string): Observable<PostData> {
    const params = new HttpParams()
      .set('populate', '*')
      .set('filters[slug][$eq]', slug)
      .set('locale', this.selectedLanguage());

    return this.http.get<PostData>(`${this.apiUrl}/posts`, { params });
  }

  getLatestPosts(locale: string): Observable<PostData> {
    if (locale === 'es') {
      locale = 'es-AR';
    }
    const params = new HttpParams()
      .set('sort', 'publishedAt:desc')
      .set('pagination[limit]', '4')
      .set('populate', '*')
      .set('locale', locale || this.selectedLanguage());

    return this.http.get<PostData>(`${this.apiUrl}/posts`, { params });
  }

  getCoursesByYoutube(locale: string): Observable<CourseData> {
    if (locale === 'es') {
      locale = 'es-AR';
    }

    const params = new HttpParams()
      .set('populate', '*')
      .set('locale', locale || this.selectedLanguage());

    return this.http.get<CourseData>(`${this.apiUrl}/courses`, {
      params,
    });
  }

  searchPost(query: string, locale: string): Observable<PostData> {
    if (locale === 'es') {
      locale = 'es-AR';
    }

    const params = new HttpParams()
      .set('filters[$or][0][title][$containsi]', query)
      .set('filters[$or][1][technology][$containsi]', query)
      .set('pagination[limit]', '5')
      .set('populate', '*')
      .set('locale', locale || this.selectedLanguage());
    return this.http.get<PostData>(`${this.apiUrl}/posts`, { params });
  }

  searchCourse(query: string, locale: string): Observable<CourseData> {
    if (locale === 'es') {
      locale = 'es-AR';
    }

    const params = new HttpParams()
      .set('filters[$or][0][title][$containsi]', query)
      .set('filters[$or][1][technology][$containsi]', query)
      .set('populate', '*')
      .set('pagination[limit]', '5')
      .set('locale', locale || this.selectedLanguage());
    return this.http.get<CourseData>(`${this.apiUrl}/courses`, { params });
  }
}

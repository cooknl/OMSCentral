import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// temporary
import * as jsonData from '../../../merged-dev.json';

@Injectable()
export class CourseService {
  cached = {};
  cacheTime: Date = null;

  constructor() {}

  processGrades(grades) {
    const totals = {};
    if (grades) {
      Object.keys(grades).forEach(grade => {
        Object.keys(grades[grade]).forEach(letter => {
          if (Object.keys(totals).indexOf(letter) !== -1) {
            totals[letter] += grades[grade][letter];
          } else {
            totals[letter] = grades[grade][letter];
          }
        });
      });
    }
    return totals;
  }

  downloadCourses() {
    const courses = (<any>jsonData).courses;
    Object.keys(courses).forEach(courseId => {
      courses[courseId].numReviews = Object.keys(courses[courseId].reviews).length;
      courses[courseId].id = courseId;
      if (courses[courseId].grades) {
        courses[courseId].totals = this.processGrades(courses[courseId].grades);
        courses[courseId].semesterGrades = Object.keys(courses[courseId].grades).map(semGrade => {
          const grade = courses[courseId].grades[semGrade];
          grade.semester = semGrade;
          return grade;
        });
      } else {
        courses[courseId].semesterGrades = [];
        courses[courseId].totals = {};
      }
    });
    this.cached = Object.assign(this.cached, courses);
    return this.courseList();
  }

  downloadCourse(courseId) {
    const course = (<any>jsonData).courses[courseId];
    course.numReviews = Object.keys(course.reviews).length;
    course.id = courseId;
    const temp = {};
    temp[courseId] = course;
    this.cached = Object.assign(this.cached, temp);
    return course;
  }

  courseList() {
    const courses = Object.keys(this.cached).map(courseId => {
      return this.cached[courseId];
    });
    return courses;
  }

  getCourses() {
    if (Object.keys(this.cached).length === 0 || this.cacheExpired()) {
      return Observable.of(this.downloadCourses());
    } else {
      return Observable.of(this.courseList());
    }
  }

  getCourse(courseId) {
    if (Object.keys(this.cached).indexOf(courseId) === -1 || this.cacheExpired()) {
      return Observable.of(this.downloadCourse(courseId));
    } else {
      return Observable.of(this.cached[courseId]);
    }
  }

  private cacheExpired() {
    if (this.cacheTime === null) {
      return true;
    } else {
      return (new Date()).valueOf() - this.cacheTime.valueOf() >= 24 * 60 * 60 * 1000;
    }
  }

}

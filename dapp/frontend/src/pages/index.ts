import { lazy } from 'react';

export const Course = lazy(() => import('./Course/Course'));
export const LessonEditor = lazy(
  () => import('./Course/LessonEditor/LessonEditor'),
);
export const CourseProgress = lazy(
  () => import('./CourseProgress/CourseProgress'),
);
export const CreateAccount = lazy(
  () => import('./CreateAccount/CreateAccount'),
);
export const ExploreCourses = lazy(
  () => import('./ExploreCourses/ExploreCourses'),
);
export const MyLearning = lazy(() => import('./MyLearning/MyLearning'));
export const NotFound = lazy(() => import('./NotFound/NotFound'));
export const TeacherDashboard = lazy(
  () => import('./TeacherDashboard/TeacherDashboard'),
);
export const Profile = lazy(() => import('./Profile/Profile'));

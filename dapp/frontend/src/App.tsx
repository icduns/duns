import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '~/components/Layout';
import { PageSuspense } from '~/components/PageSuspense';
import { RouteGuard } from '~/components/RouteGuard';
import { SearchParamsChecker } from '~/components/SearchParamsChecker';
import { Role } from '~/enums/role';
import {
  ExploreCourses,
  Profile,
  Course,
  CourseProgress,
  LessonEditor,
  CreateAccount,
  TeacherDashboard,
  MyLearning,
  NotFound,
} from '~/pages';
import { AuthProvider } from '~/providers/AuthProvider';

export function App() {
  return (
    <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
        <AuthProvider>
          <SearchParamsChecker />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ExploreCourses />} />
              <Route
                path="teacher-dashboard"
                element={
                  <RouteGuard roles={[Role.Tutor]}>
                    <TeacherDashboard />
                  </RouteGuard>
                }
              />
              <Route
                path="my-learning"
                element={
                  <RouteGuard>
                    <MyLearning />
                  </RouteGuard>
                }
              />
              <Route path="course">
                <Route
                  path=":id"
                  element={
                    <RouteGuard roles={[Role.Tutor]}>
                      <Course />
                    </RouteGuard>
                  }
                />
                <Route
                  path=":id/progress"
                  element={
                    <RouteGuard>
                      <CourseProgress />
                    </RouteGuard>
                  }
                />
                <Route
                  path=":courseId/lesson/:lessonId"
                  element={
                    <RouteGuard roles={[Role.Tutor]}>
                      <LessonEditor />
                    </RouteGuard>
                  }
                />
              </Route>
              <Route
                path="profile"
                element={
                  <RouteGuard>
                    <Profile />
                  </RouteGuard>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route
              path="/create-account"
              element={
                <RouteGuard nonAuthorized>
                  <PageSuspense>
                    <CreateAccount />
                  </PageSuspense>
                </RouteGuard>
              }
            />
          </Routes>
        </AuthProvider>
      </DndProvider>
    </BrowserRouter>
  );
}

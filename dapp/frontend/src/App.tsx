import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '~/components/Layout';
import { RouteGuard } from '~/components/RouteGuard';
import { SearchParamsChecker } from '~/components/SearchParamsChecker';
import { Role } from '~/enums/role';
import { Course } from '~/pages/Course';
import { LessonEditor } from '~/pages/Course/LessonEditor/LessonEditor';
import { CourseProgress } from '~/pages/CourseProgress';
import { CreateAccount } from '~/pages/CreateAccount';
import { ExploreCourses } from '~/pages/ExploreCourses';
import { MyLearning } from '~/pages/MyLearning';
import { NotFound } from '~/pages/NotFound';
import { Profile } from '~/pages/Profile';
import { TeacherDashboard } from '~/pages/TeacherDashboard';
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
                  <CreateAccount />
                </RouteGuard>
              }
            />
          </Routes>
        </AuthProvider>
      </DndProvider>
    </BrowserRouter>
  );
}

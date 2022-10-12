import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '~/components/Layout';
import { SearchParamsChecker } from '~/components/SearchParamsChecker';
import { Course } from '~/pages/Course';
import { LessonEditor } from '~/pages/Course/LessonEditor/LessonEditor';
import { CourseProgress } from '~/pages/CourseProgress';
import { CreateAccount } from '~/pages/CreateAccount';
import { ExploreCourses } from '~/pages/ExploreCourses';
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
              <Route path="teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="course">
                <Route path=":id" element={<Course />} />
                <Route path=":id/progress" element={<CourseProgress />} />
                <Route
                  path=":courseId/lesson/:lessonId"
                  element={<LessonEditor />}
                />
              </Route>
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/create-account" element={<CreateAccount />} />
          </Routes>
        </AuthProvider>
      </DndProvider>
    </BrowserRouter>
  );
}

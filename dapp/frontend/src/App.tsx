import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '~/components/Layout';
import { Course } from '~/pages/Course';
import { LessonEditor } from '~/pages/Course/LessonEditor/LessonEditor';
import { Courses } from '~/pages/Courses';
import { NotFound } from '~/pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Courses />} />
            <Route path="course">
              <Route path=":id" element={<Course />} />
              <Route
                path=":courseId/lesson/:lessonId"
                element={<LessonEditor />}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </DndProvider>
    </BrowserRouter>
  );
}

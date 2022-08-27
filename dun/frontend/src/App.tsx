import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '~/components/Layout';
import { Course } from '~/pages/Course';
import { Courses } from '~/pages/Courses';
import { NotFound } from '~/pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Courses />} />
          <Route path="course">
            <Route path=":id" element={<Course />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

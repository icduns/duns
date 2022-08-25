import Courses "./courses/Courses";
import Lessons "./lessons/Lessons";
import Types "./Types";

actor {
  private stable var coursesStorage: [(Text, Courses.Course)] = [];
  private stable var lessonsStorage: [(Text, Lessons.Lesson)] = [];

  let lessonsService: Lessons.LessonsService = Lessons.LessonsService();
  let coursesService: Courses.CoursesService = Courses.CoursesService();

  system func preupgrade() {
    lessonsStorage := lessonsService.exportLessons();
    coursesStorage := coursesService.exportCourses();
  };

  system func postupgrade() {
    lessonsService.importLessons(lessonsStorage);
    lessonsStorage := [];
    coursesService.importCources(coursesStorage);
    coursesStorage := [];
  };

  /* --- Courses API --- */
  public query func getCourse(id: Text): async Types.Response<Courses.Course> {
    return coursesService.getCourse(id);
  };

  public query func getCourses(): async Types.Response<[Courses.Course]> {
    return coursesService.getCourses();
  };

  public func createCourse(request: Courses.CreateCourseRequest): async Types.Response<Courses.Course> {
    return await coursesService.createCourse(request);
  };

  public func updateCourse(request: Courses.UpdateCourseRequest): async Types.Response<Courses.Course> {
    return coursesService.updateCourse(request);
  };

  public func deleteCourse(id: Text): async Types.Response<Bool> {
    switch (coursesService.deleteCourse(id)) {
      case (#ok(result)) {
        return lessonsService.deleteLessonsByCourse(id);
      };
      case (#err(result)) return #err(result);
    };
  };

  /* --- Lessons API --- */
  public query func getLesson(id: Text): async Types.Response<Lessons.Lesson> {
    return lessonsService.getLesson(id);
  };

  public query func getLessons(): async Types.Response<[Lessons.Lesson]> {
    return lessonsService.getLessons();
  };

  public query func getLessonsByCourse(courseId: Text): async Types.Response<[Lessons.Lesson]> {
    switch (coursesService.getCourse(courseId)) {
      case (#ok(course)) {
        return lessonsService.getLessonsByCourse(courseId);
      };
      case (#err(result)) return #err(result);
    };
  };

  public func createLesson(request: Lessons.CreateLessonRequest): async Types.Response<Lessons.Lesson> {
    return await lessonsService.createLesson(request);
  };

  public func updateLesson(request: Lessons.UpdateLessonRequest): async Types.Response<Lessons.Lesson> {
    return lessonsService.updateLesson(request);
  };

  public func deleteLesson(id: Text): async Types.Response<Bool> {
    return lessonsService.deleteLesson(id);
  };
}

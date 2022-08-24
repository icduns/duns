import Course "courses/Courses";
import Courses "./courses/Courses";
import Lessons "./lessons/Lessons";
import Types "./Types";

actor {
  private stable var coursesStorage: [(Text, Courses.Course)] = [];
  private stable var lessonsStorage: [(Text, Lessons.Lesson)] = [];

  let lessonsService: Lessons.LessonsService = Lessons.LessonsService(lessonsStorage);
  let coursesService: Courses.CoursesService = Courses.CoursesService(coursesStorage, lessonsService);

  system func preupgrade() {
    coursesStorage := coursesService.getCoursesForSave();
    lessonsStorage := lessonsService.getLessonsForSave();
  };

  /* --- Courses Handlers --- */
  public query func getCourse(id: Text): async Types.Response<Courses.CourseResponse> {
    coursesService.getCourse(id);
  };

  public query func getCourses(): async Types.Response<[Courses.CourseResponse]> {
    coursesService.getCourses();
  };

  public func deleteCourse(id: Text): async Types.Response<Bool> {
    coursesService.deleteCourse(id);
  };

  public func createCourse(request: Courses.CreateCourseRequest): async Types.Response<Courses.CourseResponse> {
    await coursesService.createCourse(request);
  };

  public func updateCourse(request: Courses.UpdateCourseRequest): async Types.Response<Course.Course> {
    coursesService.updateCourse(request);
  };

  /* --- Lessons Handlers --- */
  public query func getLesson(id: Text): async Types.Response<Lessons.Lesson> {
    lessonsService.getLesson(id);
  };

  public query func getLessons(): async Types.Response<[Lessons.Lesson]> {
    lessonsService.getLessons();
  };

  public func createLesson(request: Lessons.CreateLessonRequest): async Types.Response<Lessons.Lesson> {
    await lessonsService.createLesson(request);
  };

  public func deleteLesson(id: Text): async Types.Response<Bool> {
    lessonsService.deleteLesson(id);
  };

  public func deleteCourseLessons(courseId: Text): async Types.Response<Bool> {
    lessonsService.deleteCourseLessons(courseId);
  };
}

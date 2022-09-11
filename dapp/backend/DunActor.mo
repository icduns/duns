import Courses "./services/Courses";
import Lessons "./services/Lessons";

import Types "./Types";

actor {

  private let lessonService : Lessons.LessonService = Lessons.LessonService();
  private let courseService : Courses.CourseService = Courses.CourseService();

  private stable var lessonStorage : Lessons.LessonStorage = lessonService.getEmptyStorage();
  private stable var courseStorage : Courses.CourseStorage = courseService.getEmptyStorage();

  system func preupgrade() {
    lessonStorage := lessonService.exportLessons();
    courseStorage := courseService.exportCourses();
  };

  system func postupgrade() {
    lessonService.importLessons(lessonStorage);
    lessonStorage := lessonService.getEmptyStorage();

    courseService.importCources(courseStorage);
    courseStorage := courseService.getEmptyStorage();
  };

  /* --- Courses API --- */

  public query func getAllCourseCategories() : async Types.Response<[Text]> {
    return courseService.getAllCourseCategories();
  };

  public query func getCourse(id : Text) : async Types.Response<Courses.Course> {
    return courseService.getCourse(id);
  };

  public query func getCourses() : async Types.Response<[Courses.Course]> {
    return courseService.getCourses();
  };

  public query func getCoursesByCategories(categories : [Text]) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByCategories(categories);
  };

  public query func getCoursesByLevel(level : Courses.CourseLevel) : async Types.Response<[Courses.Course]> {
    return courseService.getCoursesByLevel(level);
  };

  public func createCourse(request : Courses.CreateCourseRequest) : async Types.Response<Courses.Course> {
    return await courseService.createCourse(request);
  };

  public func updateCourse(request : Courses.UpdateCourseRequest) : async Types.Response<Courses.Course> {
    return courseService.updateCourse(request);
  };

  public func deleteCourse(id : Text) : async Types.Response<Bool> {
    switch (courseService.deleteCourse(id)) {
      case (#ok(result)) {
        return lessonService.deleteLessonsByCourse(id);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  /* --- Lessons API --- */

  public query func getLesson(id : Text) : async Types.Response<Lessons.Lesson> {
    return lessonService.getLesson(id);
  };

  public query func getLessons() : async Types.Response<[Lessons.Lesson]> {
    return lessonService.getLessons();
  };

  public query func getLessonsByCourse(courseId : Text) : async Types.Response<[Lessons.Lesson]> {
    switch (courseService.getCourse(courseId)) {
      case (#ok(course)) {
        return lessonService.getLessonsByCourse(courseId);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public func createLesson(request : Lessons.CreateLessonRequest) : async Types.Response<Lessons.Lesson> {
    switch (courseService.getCourse(request.courseId)) {
      case (#ok(course)) {
        return await lessonService.createLesson(request);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

  public func updateLesson(request : Lessons.UpdateLessonRequest) : async Types.Response<Lessons.Lesson> {
    return lessonService.updateLesson(request);
  };

  public func deleteLesson(id : Text) : async Types.Response<Bool> {
    return lessonService.deleteLesson(id);
  };

  public func orderLessons(courseId : Text, lessonIds : [Text]) : async Types.Response<Bool> {
    switch (courseService.getCourse(courseId)) {
      case (#ok(course)) {
        ignore courseService.updateCourse(course);
        return lessonService.orderLessons(courseId, lessonIds);
      };
      case (#err(result)) {
        return #err(result);
      };
    };
  };

};

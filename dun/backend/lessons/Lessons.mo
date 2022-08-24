import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import LessonsTypes "./LessonsTypes";
import Types "../Types";
import Utils "../Utils";

module {
  public type Lesson = LessonsTypes.Lesson;
  public type CreateLessonRequest = LessonsTypes.CreateLessonRequest;

  public class LessonsService(savedLessons: [(Text, Lesson)]) {
    private var lessons =
      HashMap.fromIter<Text, Lesson>(savedLessons.vals(), savedLessons.size(), Text.equal, Text.hash);

    public func getLessonsForSave(): [(Text, Lesson)] {
      Iter.toArray(lessons.entries())
    };

    public func getLesson(id: Text): Types.Response<Lesson> {
      let lesson = lessons.get(id);

      switch (lesson) {
        case (?lesson) #ok(lesson);
        case (null) #err(Utils.errorResponse(#not_found, #text("Lesson with id " # id # " doesn't exists")));
      };
    };

    public func getLessons(): Types.Response<[Lesson]> {
      #ok(Iter.toArray(lessons.vals()));
    };

    public func getLessonsByCourse(courseId: Text): Types.Response<[Lesson]> {
      let filteredLessons = Iter.filter<Lesson>(lessons.vals(), func (lesson) {
        lesson.courseId == courseId;
      });

      #ok(Iter.toArray(filteredLessons));
    };

    public func createLesson(request: CreateLessonRequest): async Types.Response<Lesson> {
      let lessonUuid: Text = await Utils.genUuid();
      let lesson: Lesson = {
        id = lessonUuid;
        courseId = request.courseId;
        title = request.title;
        blocks = [];
      };

      lessons.put(lessonUuid, lesson);
      #ok(lesson);
    };

    public func deleteLesson(id: Text): Types.Response<Bool> {
      lessons.delete(id);
      #ok(true);
    };

    public func deleteCourseLessons(courseId: Text): Types.Response<Bool> {
      let lessonsToDelete = getLessonsByCourse(courseId);

      switch (lessonsToDelete) {
        case (#ok(lessonsToDelete)) {
          for (lesson in lessonsToDelete.vals()) {
            lessons.delete(lesson.id);
          };

          #ok(true);
        };
        case (#err(lessonsToDelete)) #err(lessonsToDelete);
      };
    };
  };
};

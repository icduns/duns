import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

import LessonsTypes "./LessonsTypes";
import Types "../Types";
import Utils "../Utils";

module {
  public type Lesson = LessonsTypes.Lesson;
  public type CreateLessonRequest = LessonsTypes.CreateLessonRequest;
  public type UpdateLessonRequest = LessonsTypes.UpdateLessonRequest;

  public class LessonsService() {
    private var lessons = HashMap.HashMap<Text, Lesson>(1, Text.equal, Text.hash);

    public func importLessons(storage: [(Text, Lesson)]) {
      lessons := HashMap.fromIter<Text, Lesson>(storage.vals(), storage.size(), Text.equal, Text.hash);
    };

    public func exportLessons(): [(Text, Lesson)] {
      return Iter.toArray(lessons.entries());
    };

    public func getLesson(id: Text): Types.Response<Lesson> {
      switch (lessons.get(id)) {
        case (?lesson) return #ok(lesson);
        case (null) return #err(Utils.errorResponse(#not_found, #text("Lesson with id " # id # " doesn't exists")));
      };
    };

    public func getLessons(): Types.Response<[Lesson]> {
      return #ok(Iter.toArray(lessons.vals()));
    };

    public func getLessonsByCourse(courseId: Text): Types.Response<[Lesson]> {
      let filteredLessons = Iter.filter<Lesson>(lessons.vals(), func (lesson) {
        lesson.courseId == courseId;
      });
      return #ok(Iter.toArray(filteredLessons));
    };

    public func createLesson(request: CreateLessonRequest): async Types.Response<Lesson> {
      let uuid: Text = await Utils.genUuid();
      let lesson: Lesson = {
        id = uuid;
        courseId = request.courseId;
        title = request.title;
        blocks = [];
      };
      lessons.put(lesson.id, lesson);
      return #ok(lesson);
    };

    public func updateLesson(request: UpdateLessonRequest): Types.Response<Lesson> {
      switch (getLesson(request.id)) {
        case (#ok(lesson)) {
          let updatedLesson: Lesson = {
            id = lesson.id;
            courseId = lesson.courseId;
            blocks = lesson.blocks;
            title = request.title;
          };
          lessons.put(updatedLesson.id, updatedLesson);
          return #ok(updatedLesson);
        };
        case (#err(result)) return #err(result);
      };
    };

    public func deleteLesson(id: Text): Types.Response<Bool> {
      switch (getLesson(id)) {
        case (#ok(lesson)) {
          lessons.delete(lesson.id);
          return #ok(true);
        };
        case (#err(result)) return #err(result);
      };
    };

    public func deleteLessonsByCourse(courseId: Text): Types.Response<Bool> {
      switch (getLessonsByCourse(courseId)) {
        case (#ok(lessonsToDelete)) {
          for (lesson in lessonsToDelete.vals()) {
            lessons.delete(lesson.id);
          };
          return #ok(true);
        };
        case (#err(lessonsToDelete)) return #err(lessonsToDelete);
      };
    };
  };
};

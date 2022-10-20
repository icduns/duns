import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";

import ArrayUtils "../utils/ArrayUtils";
import HashMapUtils "../utils/HashMapUtils";
import TextUtils "../utils/TextUtils";
import Utils "../utils/Utils";

import Types "../Types";

module {

  public type Lesson = {
    id : Text;
    courseId : Text;
    title : Text;
    blocks : [LessonBlock];
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type LessonBlock = {
    #text : TextBlock;
    #image : ImageBlock;
    #video : VideoBlock;
  };

  public type Block = {
    viewSettings : Text;
  };

  public type TextBlock = Block and {
    content : Text;
  };

  public type FileBlock = Block and {
    fileId : Text;
  };

  public type ImageBlock = FileBlock;

  public type VideoBlock = FileBlock;

  public type CreateLessonRequest = {
    title : Text;
    courseId : Text;
    blocks : [LessonBlock];
  };

  public type UpdateLessonRequest = {
    id : Text;
    title : Text;
    blocks : [LessonBlock];
  };

  public type LessonStorage = {
    lessons : [(Text, Lesson)];
    lessonsByCourse : [(Text, [Text])];
    lessonsByWord : [(Text, [Text])];
  };

  public class LessonService() {
    private var lessons = HashMap.HashMap<Text, Lesson>(
      1,
      Text.equal,
      Text.hash,
    );

    private var lessonsByCourse = HashMap.HashMap<Text, [Text]>(
      10,
      Text.equal,
      Text.hash,
    );

    private var lessonsByWord = HashMap.HashMap<Text, [Text]>(
      10,
      Text.equal,
      Text.hash,
    );

    public func getEmptyStorage() : LessonStorage {
      return {
        lessons = [];
        lessonsByCourse = [];
        lessonsByWord = [];
      };
    };

    public func importFromStorage(storage : LessonStorage) {
      lessons := HashMap.fromIter<Text, Lesson>(
        storage.lessons.vals(),
        storage.lessons.size(),
        Text.equal,
        Text.hash,
      );

      lessonsByCourse := HashMap.fromIter<Text, [Text]>(
        storage.lessonsByCourse.vals(),
        storage.lessonsByCourse.size(),
        Text.equal,
        Text.hash,
      );

      lessonsByWord := HashMap.fromIter<Text, [Text]>(
        storage.lessonsByWord.vals(),
        storage.lessonsByWord.size(),
        Text.equal,
        Text.hash,
      );
    };

    public func exportToStorage() : LessonStorage {
      return {
        lessons = Iter.toArray(lessons.entries());
        lessonsByCourse = Iter.toArray(lessonsByCourse.entries());
        lessonsByWord = Iter.toArray(lessonsByWord.entries());
      };
    };

    public func getLesson(id : Text) : Types.Response<Lesson> {
      switch (lessons.get(id)) {
        case (?lesson) {
          return #ok(lesson);
        };
        case (null) {
          return #err(lessonNotFoundResponse(id));
        };
      };
    };

    public func getLessons() : Types.Response<[Lesson]> {
      return #ok(Iter.toArray(lessons.vals()));
    };

    public func getLessonsByCourse(courseId : Text) : Types.Response<[Lesson]> {
      let ids : [Text] = Option.get(lessonsByCourse.get(courseId), []);
      return #ok(HashMapUtils.getFromHashMap<Text, Lesson>(lessons, ids));
    };

    public func getLessonsByWords(words : [Text]) : Types.Response<[Lesson]> {
      if (words.size() == 0) {
        return getLessons();
      };

      let lessonIds = Buffer.Buffer<Text>(10);

      for (word in words.vals()) {
        Option.iterate(
          lessonsByWord.get(word),
          func(ids : [Text]) {
            for (id in ids.vals()) {
              lessonIds.add(id);
            };
          },
        );
      };

      let ids : [Text] = ArrayUtils.removeArrayDuplicates(
        lessonIds.toArray(),
        Text.hash,
        Text.equal,
      );
      return #ok(HashMapUtils.getFromHashMap<Text, Lesson>(lessons, ids));
    };

    public func createLesson(request : CreateLessonRequest) : async Types.Response<Lesson> {
      if (not validateLessonTitle(request.title)) {
        return #err(invalidLessonResponse());
      };

      let uuid : Text = await Utils.generateUuid();
      let now : Time.Time = Time.now();

      let lesson : Lesson = {
        id = uuid;
        courseId = request.courseId;
        title = request.title;
        blocks = request.blocks;
        createdAt = now;
        updatedAt = now;
      };

      lessons.put(lesson.id, lesson);
      updateLessonsByCourse(lesson, false);
      updateLessonsByWord(
        lesson.id,
        [],
        getLessonWords(lesson),
      );
      return #ok(lesson);
    };

    public func updateLesson(request : UpdateLessonRequest) : Types.Response<Lesson> {
      switch (getLesson(request.id)) {
        case (#ok(lesson)) {
          if (not validateLessonTitle(request.title)) {
            return #err(invalidLessonResponse());
          };

          let updatedLesson : Lesson = {
            // unchanged properties
            id = lesson.id;
            courseId = lesson.courseId;
            createdAt = lesson.createdAt;
            // updated properties
            title = request.title;
            blocks = request.blocks;
            updatedAt = Time.now();
          };

          lessons.put(updatedLesson.id, updatedLesson);
          updateLessonsByWord(
            updatedLesson.id,
            getLessonWords(lesson),
            getLessonWords(updatedLesson),
          );
          return #ok(updatedLesson);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteLesson(id : Text) : Types.Response<Lesson> {
      switch (getLesson(id)) {
        case (#ok(lesson)) {
          lessons.delete(lesson.id);
          updateLessonsByCourse(lesson, true);
          updateLessonsByWord(lesson.id, getLessonWords(lesson), []);
          return #ok(lesson);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteLessonsByCourse(courseId : Text) : Types.Response<[Lesson]> {
      switch (getLessonsByCourse(courseId)) {
        case (#ok(lessonsToDelete)) {
          for (lesson in lessonsToDelete.vals()) {
            lessons.delete(lesson.id);
            updateLessonsByWord(lesson.id, getLessonWords(lesson), []);
          };
          lessonsByCourse.delete(courseId);
          return #ok(lessonsToDelete);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func orderLessons(courseId : Text, lessonIds : [Text]) : Types.Response<Bool> {
      switch (lessonsByCourse.get(courseId)) {
        case (?ids) {
          if (not validateLessonIds(courseId, ids, lessonIds)) {
            return #err(invalidLessonIdsResponse());
          };
          lessonsByCourse.put(courseId, lessonIds);
          return #ok(true);
        };
        case (null) {
          return #err(noLessonsForCourseResponse(courseId));
        };
      };
    };

    private func validateLessonTitle(title : Text) : Bool {
      return not TextUtils.isBlank(title);
    };

    private func validateLessonIds(
      courseId : Text,
      oldLessonIds : [Text],
      newLessonIds : [Text],
    ) : Bool {
      if (oldLessonIds.size() != newLessonIds.size()) {
        return false;
      };

      if (ArrayUtils.hasArrayDuplicates(newLessonIds, Text.hash, Text.equal)) {
        return false;
      };

      for (id in newLessonIds.vals()) {
        switch (lessons.get(id)) {
          case (?lesson) {
            if (lesson.courseId != courseId) {
              return false;
            };
          };
          case (null) {
            return false;
          };
        };
      };

      return true;
    };

    private func updateLessonsByCourse(lesson : Lesson, delete : Bool) {
      let oldKeys : [Text] = if (delete) {
        [lesson.courseId];
      } else {
        [];
      };

      let newKeys : [Text] = if (delete) {
        [];
      } else {
        [lesson.courseId];
      };

      HashMapUtils.updateHashMapOfArrays(
        lessonsByCourse,
        lesson.id,
        oldKeys,
        newKeys,
        Text.equal,
        Text.equal,
        Text.hash,
      );
    };

    private func updateLessonsByWord(
      lessonId : Text,
      oldWords : [Text],
      newWords : [Text],
    ) {
      HashMapUtils.updateHashMapOfArrays(
        lessonsByWord,
        lessonId,
        oldWords,
        newWords,
        Text.equal,
        Text.equal,
        Text.hash,
      );
    };

    private func lessonNotFoundResponse(id : Text) : Types.ErrorResponse {
      return Utils.errorResponse(
        #not_found,
        #text(
          "Lesson with id " # id # " doesn't exist",
        ),
      );
    };

    private func invalidLessonResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed lesson is invalid: title should not be blank",
        ),
      );
    };

    private func invalidLessonIdsResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed lessonIds are invalid",
        ),
      );
    };

    private func noLessonsForCourseResponse(courseId : Text) : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "There are no lessons for course with id " # courseId,
        ),
      );
    };

    private func getLessonWords(lesson : Lesson) : [Text] {
      return ArrayUtils.removeArrayDuplicates(
        TextUtils.splitToWords(lesson.title),
        Text.hash,
        Text.equal,
      );
    };

  };

};

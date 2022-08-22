import LessonTypes "../lesson/LessonTypes"

module {
  type Lesson = LessonTypes.Lesson;

  public type Course = {
    title: Text;
    subtitle: Text;
    image: Blob; // ???
    category: Text; // ???
    description: Text;
    published: Bool;
    lessons: [Lesson];
  };
};

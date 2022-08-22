module {
  public type Lesson = {
    name: Text;
    blocks: [LessonBlock];
  };

  public type LessonBlock = {
    #video: {
      file: Blob;
    };
    #image: {
      file: Blob;
    };
    #text: {
      text: Text;
    };
  };
};

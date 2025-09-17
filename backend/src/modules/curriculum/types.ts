export type CurriculumTopicBase = {
  courseCode: string;
  topicCode: string;
  topicPath: string;     // ders>konu>alt_konu
  unitOrWeek?: string;
  readingLevel?: string;
};

export type CurriculumTopicCreate = CurriculumTopicBase;

export type CurriculumTopicUpdate = Partial<
  Omit<CurriculumTopicBase, 'topicCode'>
>;

export type ListQuery = {
  courseCode?: string;
  search?: string;
  page: number;
  pageSize: number;
};

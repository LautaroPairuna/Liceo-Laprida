export const EDUCATION_PLATFORM = Symbol("EDUCATION_PLATFORM");

export type PlatformStudent = {
  enrollmentId: string;
  name: string;
  email: string;
  dni: string;
  courseId: string;
  courseTitle: string;
  modality: string;
};

export type AccessResult =
  | { status: "granted"; note?: string }
  | { status: "pending"; note: string };

/** Gives a paying student access to their course in the institution's educational platform. */
export interface EducationPlatform {
  grantAccess(student: PlatformStudent): Promise<AccessResult>;
}

/**
 * Class and Subject Ownership Helpers
 * Handles user-based filtering to ensure teachers see their own classes
 * while maintaining ability to view school-wide classes.
 */

export const normalizePersonName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/(s\.pd\.?|s\.e\.?|m\.pd\.?|dra\.?|dr\.?|ir\.?|prof\.?)/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const isNameMatch = (name1, name2) => {
  if (!name1 || !name2) return false;
  const n1 = name1.trim().toLowerCase();
  const n2 = name2.trim().toLowerCase();
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const norm1 = normalizePersonName(name1);
  const norm2 = normalizePersonName(name2);
  if (norm1 && norm2 && (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1))) {
    return true;
  }
  return false;
};

/**
 * Checks if a class belongs to or is managed/taught by the given profile.
 * - Profile is Wali Kelas
 * - Profile is the Creator of the class
 * - Profile is a teacher (guru_pengampu / guru_name / dosen_name) of any mapel linked to this class
 */
export const isClassOwnedOrTaughtBy = (kelas, profile, mkList = []) => {
  if (!kelas || !profile) return false;

  const profileName = profile.full_name || '';
  const profileId = profile.id;

  // 1. Direct creator check
  if (profileId && kelas.created_by && kelas.created_by === profileId) {
    return true;
  }
  if (profileName && kelas.created_by_name && isNameMatch(kelas.created_by_name, profileName)) {
    return true;
  }

  // 2. Wali kelas check
  if (profileName && kelas.wali_kelas && isNameMatch(kelas.wali_kelas, profileName)) {
    return true;
  }

  // 3. Teaching mapel check
  if (Array.isArray(kelas.mapel_ids) && kelas.mapel_ids.length > 0 && Array.isArray(mkList)) {
    const isTeaching = kelas.mapel_ids.some((mkId) => {
      const mk = mkList.find((m) => m.id === mkId);
      if (!mk) return false;
      if (profileName && (isNameMatch(mk.guru_name, profileName) || isNameMatch(mk.dosen_name, profileName))) {
        return true;
      }
      if (profileId && (mk.guru_id === profileId || mk.dosen_id === profileId)) {
        return true;
      }
      return (mk.rombel || []).some((r) => {
        if (profileName && (isNameMatch(r.guru_pengampu, profileName) || isNameMatch(r.dosen_pengampu, profileName))) {
          return true;
        }
        return false;
      });
    });
    if (isTeaching) return true;
  }

  return false;
};

/**
 * Checks if a course/subject is taught by the given profile.
 */
export const isCourseTaughtBy = (mk, profile) => {
  if (!mk || !profile) return false;
  const profileName = profile.full_name || '';
  const profileId = profile.id;

  if (profileId && (mk.dosen_id === profileId || mk.guru_id === profileId)) {
    return true;
  }
  if (profileName && (isNameMatch(mk.dosen_name, profileName) || isNameMatch(mk.guru_name, profileName))) {
    return true;
  }
  return (mk.rombel || []).some((r) => {
    if (profileName && (isNameMatch(r.guru_pengampu, profileName) || isNameMatch(r.dosen_pengampu, profileName))) {
      return true;
    }
    return false;
  });
};

/**
 * Checks if a student/learner is enrolled in a class.
 */
export const isLearnerEnrolledInClass = (kelas, profile) => {
  if (!kelas || !profile) return false;
  const students = kelas.students || [];
  const profileId = profile.id;
  const profileName = profile.full_name || '';
  const profileNim = profile.nim || profile.nisn || '';

  return students.some((s) => {
    if (profileId && (s.id === profileId || s.student_id === profileId)) return true;
    if (profileNim && (s.nim === profileNim || s.nisn === profileNim)) return true;
    if (profileName && isNameMatch(s.full_name, profileName)) return true;
    return false;
  });
};

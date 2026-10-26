// Small hand-written validators so the code stays easy to read.
// Each function returns an array of error messages (empty array = valid).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = ({ name, email, password }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  return errors;
};

const validateLogin = ({ email, password }) => {
  const errors = [];
  if (!email || !EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
  if (!password) errors.push('Password is required.');
  return errors;
};

const isValidUrl = (value) => {
  // Allow local paths such as /posters/example.svg as well as full http(s) links.
  if (typeof value === 'string' && /^\/[^\s/][^\s]*$/.test(value)) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateMovie = ({ title, description, genre, releaseYear, posterUrl }, partial = false) => {
  const errors = [];
  const has = (v) => v !== undefined && v !== null && v !== '';

  if (!partial || has(title)) {
    if (!title || !String(title).trim()) errors.push('Title is required.');
  }
  if (!partial || has(description)) {
    if (!description || String(description).trim().length < 10) {
      errors.push('Description must be at least 10 characters.');
    }
  }
  if (!partial || has(genre)) {
    if (!genre || !String(genre).trim()) errors.push('Genre is required.');
  }
  if (!partial || has(releaseYear)) {
    const y = Number(releaseYear);
    if (!Number.isInteger(y) || y < 1888 || y > new Date().getFullYear() + 5) {
      errors.push('Release year must be a valid year.');
    }
  }
  if (!partial || has(posterUrl)) {
    if (!posterUrl || !isValidUrl(posterUrl)) errors.push('Poster URL must be a valid http(s) link or a local path like /posters/x.svg.');
  }
  return errors;
};

const validateReview = ({ rating, comment }) => {
  const errors = [];
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) errors.push('Rating must be a whole number from 1 to 5.');
  if (comment && String(comment).length > 1000) errors.push('Comment must be 1000 characters or fewer.');
  return errors;
};

module.exports = { validateRegister, validateLogin, validateMovie, validateReview };

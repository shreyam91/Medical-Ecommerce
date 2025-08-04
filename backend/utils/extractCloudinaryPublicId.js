module.exports = function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
};

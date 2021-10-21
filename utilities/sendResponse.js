module.exports = (res, status, data) => {
  res.status(200).json({
    ...data
  });
}
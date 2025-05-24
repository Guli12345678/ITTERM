const sendErrorResponse = (error, res) => {
  console.log(error);
  // console.log(error.details);
  res.status(400).send({ error: error.message });
};

module.exports = {
  sendErrorResponse,
};

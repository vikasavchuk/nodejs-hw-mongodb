export const ctrlWrapper = (ctrl) => (req, res, next) => {
  ctrl(req, res, next).catch(next);
};
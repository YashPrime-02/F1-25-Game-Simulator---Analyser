export const commentators = [
  {
    name: "Crofty",
    style: "Excited",
  },
  {
    name: "Brundle",
    style: "Analytical",
  },
  {
    name: "Paddock Insider",
    style: "Political",
  },
];

export const assignVoice = (index) => {
  return commentators[index % commentators.length];
};
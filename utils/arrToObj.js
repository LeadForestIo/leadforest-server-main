module.exports = (data = []) => {
  const str = JSON.stringify(data);
  const rep2 = `{${str.replace(/\]|\[/g, '').replace(/(",")/g, '":"","')}:""}`;
  return JSON.parse(rep2);
};

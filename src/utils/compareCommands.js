module.exports = (existCmd, localCmd) => {
  const adaBeda = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  if (
    adaBeda(existCmd.name, localCmd.data.name) ||
    adaBeda(existCmd.description, localCmd.data.description)
  ) {
    return true;
  }

  const optBeda = adaBeda(optionFormat(existCmd), optionFormat(localCmd.data));

  function optionFormat(cmd) {
    const cleanObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === "object") {
          cleanObject(obj[key]);
          if (obj[key] || (Array.isArray(obj[key]) && obj[key].length === 0)) {
            delete obj[key];
          }
        } else if (obj[key] === undefined) {
          delete obj[key];
        }
      }
    };

    const normalizeObject = (input) => {
      if (Array.isArray(input)) {
        return input.map((item) => normalizeObject(item));
      }
      const normalizedItem = {
        type: input.type,
        name: input.name,
        description: input.description,
        options: input.options ? normalizeObject(input.options) : undefined,
        required: input.required,
      };
      return normalizedItem;
    };

    return (cmd.options || []).map((option) => {
      let cleanOption = JSON.parse(JSON.stringify(option));
      cleanOption.options
        ? (cleanOption.options = normalizeObject(cleanOption.options))
        : (cleanOption = normalizeObject(cleanOption));
      cleanObject(cleanOption);
      return {
        ...cleanOption,
        choices: cleanOption.choices
          ? JSON.stringify(cleanOption.choices.map((c) => c.value))
          : null,
      };
    });
  }
};

function paginate(model, limit, page) {
  /**
   * seta variável com valor 1
   */
  let pages = 1;

  /**
   * Conta total de registros
   */
  const total = model.count;

  /**
   * Calcula a quantidade de páginas caso total
   * de registros seja maior que o limite por página
   */
  if (!(total < limit)) {
    /**
     * retorna 1 em caso de erro no cálculo
     */
    const calc = Math.ceil(total / limit);
    pages = Number.isNaN(calc) ? pages : calc;
  }

  /**
   * ativa próxima pagina
   */
  const nextPage = page < pages;

  /**
   * ativa pagina anterior
   */
  const prevPage = page <= pages && page > 1;

  return {
    docs: model.rows,
    pagination: {
      total: Number(total),
      limit: Number(limit),
      page: Number(page),
      pages: Number(pages),
      prevPage,
      nextPage,
    },
  };
}

export default paginate;

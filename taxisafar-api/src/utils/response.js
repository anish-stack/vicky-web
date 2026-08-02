const ok = (res, data, message = "Success", meta) =>
  res.status(200).json({ status: true, message, data, ...(meta ? { meta } : {}) });

const created = (res, data, message = "Created successfully") =>
  res.status(201).json({ status: true, message, data });

const paginate = (query, defaults = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = parseInt(query.items_per_page || query.limit, 10) || defaults.limit || 20;
  const limit = Math.min(Math.max(1, rawLimit), 200);
  return { page, limit, skip: (page - 1) * limit };
};

const pageMeta = (total, page, limit) => ({
  total, page, items_per_page: limit,
  last_page: Math.max(1, Math.ceil(total / limit)),
  from: total === 0 ? 0 : (page - 1) * limit + 1,
  to: Math.min(page * limit, total),
});

module.exports = { ok, created, paginate, pageMeta };

package com.lucifer.sudoku.service;


import com.lucifer.sudoku.domain.Identificator;

import java.util.List;

public interface BaseService<Entity extends Identificator> {
    public Entity save(Entity entity);

    public Entity delete(Long id);

    public List<Entity> getAll();

    public List<Entity> getPage(Long page);

    public Entity findById(Long id);
}

package com.lucifer.sudoku.service;

import com.lucifer.sudoku.dao.BaseDao;
import com.lucifer.sudoku.domain.Identificator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public abstract class BaseServiceImpl<Entity extends Identificator> implements BaseService<Entity> {
    @Autowired
    protected BaseDao<Entity> dao;

    public Entity save(Entity entity) {
        return dao.save(entity);
    }

    public List<Entity> getAll() {
        return dao.getAll();
    }

    public List<Entity> getPage(Long page) {
        return dao.getPage(page);
    }

    public Entity delete(Long id) {
        return dao.delete(id);
    }

    public Entity findById(Long id) {
        return dao.findById(id);
    }
}

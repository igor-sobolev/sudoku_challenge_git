package com.lucifer.sudoku.dao;

import com.lucifer.sudoku.domain.Identificator;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.lang.reflect.ParameterizedType;
import java.util.List;

public abstract class BaseDaoImpl<Entity extends Identificator> implements BaseDao<Entity> {

    @Autowired
    private SessionFactory sessionFactory;

    private static final int LIMIT_PER_PAGE = 10;

    protected Session getSession() {
        return sessionFactory.getCurrentSession();
    }

    public Entity save(Entity entity) {
        getSession().saveOrUpdate(entity);
        return entity;
    }

    public Entity delete(Long id) {
        Entity entity = findById(id);
        getSession().delete(entity);
        return entity;
    }

    public Entity findById(Long id) {
        Entity entity = (Entity) getSession().get(getType(), id);
        return entity;
    }

    public List<Entity> getAll() {
        Session session = getSession();
        Query query = session.createQuery("FROM " + getType().getSimpleName());
        return query.list();
    }

    public List<Entity> getPage(Long page) {
        Session session = getSession();
        Query query = session.createQuery("FROM " + getType().getSimpleName());
        query.setFirstResult((int)(page * LIMIT_PER_PAGE));
        query.setMaxResults((int)LIMIT_PER_PAGE);
        return (List<Entity>) query.list();
    }

    protected Class getType() {
        return getGenericParameterClass(this.getClass(), 0);
    }

    protected Class getGenericParameterClass(Class actualClass, int parameterIndex) {
        return (Class) ((ParameterizedType) actualClass.getGenericSuperclass()).getActualTypeArguments()[parameterIndex];
    }
}
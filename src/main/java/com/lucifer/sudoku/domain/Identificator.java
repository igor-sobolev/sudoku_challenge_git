package com.lucifer.sudoku.domain;

import javax.persistence.*;

@MappedSuperclass
public abstract class Identificator {
    @Id
    @Column(name = "ID")
    @GeneratedValue
    protected Long id;

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

}

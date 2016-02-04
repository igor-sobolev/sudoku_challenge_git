package com.lucifer.sudoku.domain;

/**
 * Created by PiCy on 8/7/2015.
 */

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.Comparator;


@Entity
@Table(name = "PERSON")
public class Person extends Identificator implements Serializable {

    @Column(name = "VK")
    private Long vk;

    @Column(name = "FULL_NAME")
    private String fullName;

    @Column(name = "POINTS")
    private Long points;

    public Person() {

    }

    public Person(Long vk) {
        this.vk = vk;
        this.points = 0l;
    }

    public Person(Long vk, String fullName) {
        this.vk = vk;
        this.fullName = fullName;
        this.points = 0l;
    }

    public Long getVk() {
        return vk;
    }

    public void setVk(Long vk) {
        this.vk = vk;
    }

    public Long getPoints() {
        return points;
    }

    public void setPoints(Long points) {
        this.points = points;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Person person = (Person) o;

        return vk.equals(person.vk);

    }

    @Override
    public int hashCode() {
        return vk.hashCode();
    }
}
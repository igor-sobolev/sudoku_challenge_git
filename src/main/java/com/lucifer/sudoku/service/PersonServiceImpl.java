package com.lucifer.sudoku.service;


import com.lucifer.sudoku.DTO.PersonDTO;
import com.lucifer.sudoku.domain.Person;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;


@Service
@Transactional
public class PersonServiceImpl extends BaseServiceImpl<Person> implements PersonService {

    public List<Person> getTop() {
        List<Person> all = getAll();
        Collections.sort(all, new Comparator<Person>() {
            public int compare(Person o1, Person o2) {
                return (int) (o2.getPoints() - o1.getPoints());
            }
        });
        while (all.size() < 10) {
            all.add(new Person(0L, "None"));
        }
        return all.subList(0, 10);
    }

    public Person logIn(PersonDTO person) {
        List<Person> persons = dao.getAll();
        Iterator<Person> it = persons.iterator();
        while (it.hasNext()) {
            Person u = it.next();
            if (u.getVk().equals(person.getId())) {
                u.setFullName(person.getFirst_name() + " " + person.getLast_name());
                return dao.save(u);
            }
        }
        Person newPerson = new Person(person.getId(), person.getFirst_name() + " " + person.getLast_name());
        return dao.save(newPerson);
    }

    public Person solved(PersonDTO person) {
        List<Person> persons = dao.getAll();
        Iterator<Person> it = persons.iterator();
        while (it.hasNext()) {
            Person u = it.next();
            if (u.getVk().equals(person.getId())) {
                u.setPoints(u.getPoints() + person.getPoints());
                return dao.save(u);
            }
        }
        return null;
    }
}

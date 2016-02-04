package com.lucifer.sudoku.service;


import com.lucifer.sudoku.DTO.PersonDTO;
import com.lucifer.sudoku.domain.Person;

import java.util.List;

public interface PersonService extends BaseService<Person> {

    public List<Person> getTop();

    public Person logIn(PersonDTO person);

    Person solved(PersonDTO person);
}

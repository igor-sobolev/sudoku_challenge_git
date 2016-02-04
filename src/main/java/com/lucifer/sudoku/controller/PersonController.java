package com.lucifer.sudoku.controller;

import com.lucifer.sudoku.DTO.PersonDTO;
import com.lucifer.sudoku.domain.Person;
import com.lucifer.sudoku.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * Created by Игорь on 19.06.2015.
 */
@Controller
@RequestMapping(value = "/persons")
public class PersonController {
    @Autowired
    PersonService personService;

    @RequestMapping(value = "/solved/", method = RequestMethod.POST)
    @ResponseBody
    public Person solved(PersonDTO person) {
        return personService.solved(person);
    }

    @RequestMapping(value = "/login/", method = RequestMethod.POST)
    @ResponseBody
    public Person logIn(PersonDTO person) {
        return personService.logIn(person);
    }

    @RequestMapping(value = "/get_top/", method = RequestMethod.GET)
    @ResponseBody
    public List<Person> getTop() {
        return personService.getTop();
    }
}

import { TreeNode } from '../../types/familyTree';

export const LARGE_FAMILY_TREE: TreeNode = {
  id: 'great-grandpa',
  name: '王德明',
  gender: 'male',
  birthDate: '1920-03-10',
  deathDate: '2005-12-25',
  spouse: {
    id: 'great-grandma',
    name: '陈秀兰',
    gender: 'female',
    birthDate: '1922-07-20',
    deathDate: '2010-05-15',
    children: [],
  },
  children: [
    {
      id: 'grandpa',
      name: '王建国',
      gender: 'male',
      birthDate: '1950-11-05',
      deathDate: '2018-08-20',
      spouse: {
        id: 'grandma',
        name: '刘秀英',
        gender: 'female',
        birthDate: '1952-02-18',
        deathDate: '2020-03-10',
        children: [],
      },
      children: [
        {
          id: 'father',
          name: '王志强',
          gender: 'male',
          birthDate: '1975-06-25',
          spouse: {
            id: 'mother',
            name: '赵丽华',
            gender: 'female',
            birthDate: '1978-09-10',
            children: [],
          },
          children: [
            {
              id: 'child1',
              name: '王小明',
              gender: 'male',
              birthDate: '2003-04-15',
              children: [],
            },
            {
              id: 'child2',
              name: '王晓丽',
              gender: 'female',
              birthDate: '2006-11-20',
              children: [],
            },
          ],
        },
        {
          id: 'uncle',
          name: '王志刚',
          gender: 'male',
          birthDate: '1978-03-12',
          spouse: {
            id: 'aunt',
            name: '周美玲',
            gender: 'female',
            birthDate: '1980-07-05',
            children: [],
          },
          children: [
            {
              id: 'cousin',
              name: '王子豪',
              gender: 'male',
              birthDate: '2008-02-14',
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 'aunt-maternal',
      name: '王秀珍',
      gender: 'female',
      birthDate: '1955-09-22',
      spouse: {
        id: 'uncle-in-law',
        name: '李文博',
        gender: 'male',
        birthDate: '1953-12-01',
        children: [],
      },
      children: [
        {
          id: 'cousin2',
          name: '李雪梅',
          gender: 'female',
          birthDate: '1982-05-30',
          children: [],
        },
      ],
    },
  ],
};

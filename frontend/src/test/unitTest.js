import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import TodoList from '@/components/TodoList.vue';

jest.mock('axios');

describe('TodoList.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(TodoList);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the initial structure correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.findAll('li').length).toBe(0);
  });

  it('fetches todos and tags on mount', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ _id: '1', title: 'Task 1', completed: false }] });
    axios.get.mockResolvedValueOnce({ data: [{ _id: '1', name: 'Tag 1' }] });

    await wrapper.vm.fetchTodos();
    await wrapper.vm.fetchTags();

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(wrapper.vm.todos.length).toBe(1);
    expect(wrapper.vm.availableTags.length).toBe(1);
  });

    //Ajout des taches
  it('adds a new todo', async () => {
    const newTodo = 'New Task';
    wrapper.setData({ newTodo });
    axios.post.mockResolvedValueOnce({ data: { _id: '2', title: newTodo, completed: false } });

    await wrapper.vm.addTodo();

    expect(axios.post).toHaveBeenCalledWith('/api/todos', { title: newTodo });
    expect(wrapper.vm.todos).toHaveLength(1);
    expect(wrapper.vm.newTodo).toBe('');
  });

  // Suppression de taches
it('deletes a todo', async () => {
  wrapper.setData({ todos: [{ _id: '1', title: 'Task 1', completed: false }] });
  axios.delete.mockResolvedValueOnce();

  await wrapper.vm.deleteTodo('1');

  expect(axios.delete).toHaveBeenCalledWith('/api/todos/1');
  expect(wrapper.vm.todos).toHaveLength(0);
});

  // Mise à jour des tâches
it('updates a todo status', async () => {
  const todo = { _id: '1', title: 'Task 1', completed: false };
  wrapper.setData({ todos: [todo] });
  axios.patch.mockResolvedValueOnce();

  todo.completed = true;
  await wrapper.vm.updateTodo(todo);

  expect(axios.patch).toHaveBeenCalledWith(`/api/todos/1`, { completed: true });
});
 
//Filtrage par statut
it('filters todos by status', async () => {
  wrapper.setData({ todos: [{ _id: '1', title: 'Task 1', completed: false }] });
  axios.get.mockResolvedValueOnce({
    data: { todos: [{ _id: '2', title: 'Task 2', completed: true }] },
  });

  wrapper.setData({ statusFilter: 'completed' });
  await wrapper.vm.filterByStatus();

  expect(axios.get).toHaveBeenCalledWith('/api/todos/filter', { params: { status: 'completed' } });
  expect(wrapper.vm.todos).toHaveLength(1);
});

//Filtrage par tag
it('filters todos by tag', async () => {
  axios.get.mockResolvedValueOnce({
    data: { todos: [{ _id: '1', title: 'Task 1', tags: [{ _id: 'tag1', name: 'Tag 1' }] }] },
  });

  wrapper.setData({ selectedTag: 'tag1' });
  await wrapper.vm.filterByTag();

  expect(axios.get).toHaveBeenCalledWith('/api/todos/by-tag/tag1');
  expect(wrapper.vm.todosByTag).toHaveLength(1);
});

//Mise a jour de la priorite
it('updates the priority of a todo', async () => {
  const todo = { _id: '1', title: 'Task 1', priority: 'low' };
  wrapper.setData({ todos: [todo] });
  axios.patch.mockResolvedValueOnce();

  todo.priority = 'high';
  await wrapper.vm.updatePriority(todo);

  expect(axios.patch).toHaveBeenCalledWith(`/api/todos/1/priority`, { priority: 'high' });
});

//Notifications
it('displays notifications', () => {
  wrapper.vm.showNotification('Test notification', 'bg-green-100 text-green-700');

  expect(wrapper.vm.notification).toBe('Test notification');
  expect(wrapper.vm.notificationClass).toBe('bg-green-100 text-green-700');
});




  
});

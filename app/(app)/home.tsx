import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  // HAPUS FlatList dari import
  TouchableOpacity,
  Dimensions,
  Modal, 
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// --- TAMBAHKAN INI ---
import { SwipeListView } from 'react-native-swipe-list-view'; 
// ---------------------
import AddTaskModal from './AddTaskModal'; 

type TaskPriority = 'High' | 'Medium' | 'Low';
type FilterType = 'Today' | 'Week' | 'Upcoming' | 'Overdue';

interface Task {
  id: string;
  project: string;
  title: string;
  priority: TaskPriority;
  completedAt: string | null; 
  category: 'Work' | 'Daily' | 'Vacation' | 'Me time' | 'Health';
  dueDate: string; 
}

interface TaskItemProps {
  item: Task;
  onToggleCompletion: (id: string) => void;
}

const MOCK_CATEGORIES: string[] = ['Work', 'Daily', 'Vacation', 'Me time', 'Health'];

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'Today', label: 'Hari ini' },
  { key: 'Week', label: 'Minggu ini' },
  { key: 'Upcoming', label: 'Mendatang' },
  { key: 'Overdue', label: 'Terlambat' },
];

// --- DATA DUMMY (FINAL) ---
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const endOfWeek = new Date(today);
endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
const yesterdayNight = new Date(yesterday);
yesterdayNight.setHours(23, 0, 0, 0);

const INITIAL_TASKS: Task[] = [
  { id: '1', project: 'Grocery app', title: 'Market Research', priority: 'High', completedAt: null, category: 'Work', dueDate: today.toISOString() },
  { id: '2', project: 'Personal', title: 'Bayar tagihan', priority: 'Medium', completedAt: null, category: 'Daily', dueDate: tomorrow.toISOString() },
  { id: '3', project: 'Refactor', title: 'Buat Wireframe', priority: 'Low', completedAt: null, category: 'Work', dueDate: nextWeek.toISOString() },
  { id: '4G', project: 'Grocery app', title: 'Analisis Kompetitor', priority: 'High', completedAt: null, category: 'Work', dueDate: endOfWeek.toISOString() },
  { id: '5', project: 'Tugas Kuliah', title: 'Revisi Laporan (Terlambat)', priority: 'High', completedAt: null, category: 'Work', dueDate: yesterday.toISOString() },
  { id: '6', project: 'Tugas Kuliah', title: 'Kumpulkan Laporan (Akan hilang)', priority: 'High', completedAt: yesterdayNight.toISOString(), category: 'Work', dueDate: yesterday.toISOString() },
  { id: '7', project: 'Tugas Kuliah', title: 'Presentasi (Baru selesai)', priority: 'Medium', completedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), category: 'Work', dueDate: today.toISOString() },
];

// --- FUNGSI HELPER ---

const formatDisplayDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (dateStart.getTime() === todayStart.getTime()) { return '📅 Hari ini'; }
  if (dateStart.getTime() === tomorrowStart.getTime()) { return '📅 Besok'; }
  if (dateStart.getTime() === yesterdayStart.getTime()) { return '📅 Kemarin'; }
  
  return `📅 ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', })}`;
};

const getPriorityStyle = (priority: TaskPriority) => {
  switch (priority) {
    case 'High': return { container: styles.priorityHigh, text: styles.priorityTextHigh };
    case 'Medium': return { container: styles.priorityMedium, text: styles.priorityTextMedium };
    case 'Low': return { container: styles.priorityLow, text: styles.priorityTextLow };
    default: return { container: {}, text: {} };
  }
};

// --- KOMPONEN CHILD ---

const TaskItem: React.FC<any> = ({ item, onToggleCompletion }) => {
  const priorityStyle = getPriorityStyle(item.priority);

  return (
    <View style={[styles.taskCard, item.completedAt && styles.taskCardCompleted]}>
      <TouchableOpacity onPress={() => onToggleCompletion(item.id)}>
        <Icon
          name={item.completedAt ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={26}
          color={item.completedAt ? '#5A31F4' : '#888'}
          style={styles.checkbox}
        />
      </TouchableOpacity>
        
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskProject, item.completedAt && styles.taskTextCompleted]}>
          {item.project}
        </Text>
        <Text style={[styles.taskTitle, item.completedAt && styles.taskTextCompleted]}>
          {item.title}
        </Text>
        {!item.completedAt && <Text style={styles.taskDueDate}>{formatDisplayDate(item.dueDate)}</Text>}
      </View>

      {!item.completedAt && (
        <View style={[styles.priorityTag, priorityStyle.container]}>
          <Text style={[styles.priorityTagText, priorityStyle.text]}>{item.priority}</Text>
        </View>
      )}
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <Icon name="clipboard-text-outline" size={80} color="#CCC" />
    <Text style={styles.emptyStateText}>Tidak Ada Tugas</Text>
    <Text style={styles.emptyStateSubText}>
      Mulai tambahkan tugas baru dengan menekan tombol '+' di bawah.
    </Text>
  </View>
);

// --- KOMPONEN UTAMA ---

const Home: React.FC = () => {
  type CategoryLiteral = Task['category'];
  
  const [activeCategory, setActiveCategory] = useState<string>('Work');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Today'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // --- STATE FORM BARU ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<CategoryLiteral>(MOCK_CATEGORIES[0] as CategoryLiteral);
  const [newTaskDueDate, setNewTaskDueDate] = useState(today.toISOString());
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  // ------------------------

  const getActiveFilterLabel = () => {
    return FILTERS.find(f => f.key === activeFilter)?.label || 'Filter';
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id === id) {
          if (task.completedAt === null) {
            return { ...task, completedAt: new Date().toISOString() };
          }
          return { ...task, completedAt: null };
        }
        return task;
      })
    );
  };
  
  // --- FUNGSI HAPUS DAN EDIT BARU ---
  const deleteTask = (id: string) => {
    // Menghapus tugas dari state lokal
    setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
    alert('Tugas berhasil dihapus!');
  };

  const editTask = (id: string) => {
    // Logika untuk mengisi form modal dengan data tugas yang akan diedit
    alert(`Membuka modal untuk Edit Tugas dengan ID: ${id}`);
    // Untuk mengimplementasikan edit: Anda perlu mencari tugas di 'tasks',
    // mengisi state form (setNewTaskTitle, dll), dan membuka modal (setIsModalVisible(true)).
  };
  // ----------------------------------

  const addTask = () => {
      if (newTaskTitle.trim() === '') {
          alert('Judul tugas tidak boleh kosong.');
          return;
      }

      const newId = (tasks.length + 1).toString() + '-' + Date.now().toString();

      const newTask: Task = {
          id: newId,
          project: 'Personal',
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          completedAt: null,
          category: newTaskCategory,
          dueDate: newTaskDueDate,
      };

      setTasks((prevTasks) => [newTask, ...prevTasks]);
      
      setNewTaskTitle('');
      setNewTaskCategory(MOCK_CATEGORIES[0] as CategoryLiteral);
      setIsModalVisible(false);
  };

  const displayedTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const tasksByCategory = tasks.filter(task => task.category === activeCategory);

    const tasksByFilter = tasksByCategory.filter(task => {
      if (task.completedAt) { return true; }
      const taskDate = new Date(task.dueDate);
      switch (activeFilter) {
        case 'Today':
          return taskDate >= startOfToday && taskDate <= endOfToday;
        case 'Week':
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        case 'Overdue':
          return taskDate < startOfToday && task.completedAt === null; 
        case 'Upcoming':
          return taskDate > endOfWeek;
        default:
          return true;
      }
    });
    
    return tasksByFilter.filter(task => {
      if (task.completedAt === null) { return true; }
      const completedTime = new Date(task.completedAt);
      return completedTime >= startOfToday;
    });

  }, [tasks, activeCategory, activeFilter]); 

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
              <Text style={styles.headerTitle}>To-Do Lists</Text>
              <TouchableOpacity>
                <Icon name="dots-vertical" size={28} color="#333" />
              </TouchableOpacity>
          </View>

          {/* CATEGORIES */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOCK_CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryChip,
                    activeCategory === category ? styles.categoryChipActive : styles.categoryChipInactive,
                  ]}
                  onPress={() => {
                    setActiveCategory(category);
                    setActiveFilter('Today');
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      activeCategory === category ? styles.categoryTextActive : styles.categoryTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* FILTER DROPDOWN */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.dropdownTriggerText}>{getActiveFilterLabel()}</Text>
              <Icon name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#5A31F4" />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setActiveFilter(filter.key);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        activeFilter === filter.key && styles.dropdownItemTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* --- [SWIPE LIST VIEW DISINI] --- */}
          <View style={styles.listContainer}>
            {displayedTasks.length === 0 ? (
              <EmptyState />
            ) : (
              <SwipeListView
                data={displayedTasks}
                renderItem={({ item }) => (
                  <TaskItem item={item} onToggleCompletion={toggleTaskCompletion} />
                )}
                // --- TAMPILAN BELAKANG (Swipe Actions) ---
                renderHiddenItem={({ item }) => (
                  <View style={styles.rowBack}>
                    
                    {/* Tombol Hapus (Diposisikan di Kanan) */}
                    <TouchableOpacity
                      style={[styles.backBtn, styles.backBtnDelete]}
                      onPress={() => deleteTask(item.id)}
                      activeOpacity={0.8}
                    >
                      <Icon name="delete-outline" size={25} color="#FFFFFF" />
                      <Text style={styles.backBtnText}>Hapus</Text>
                    </TouchableOpacity>
                    
                    {/* Tombol Edit */}
                    <TouchableOpacity
                      style={[styles.backBtn, styles.backBtnEdit]}
                      onPress={() => editTask(item.id)}
                      activeOpacity={0.8}
                    >
                      <Icon name="pencil-outline" size={25} color="#FFFFFF" />
                      <Text style={styles.backBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                rightOpenValue={-150} // Jarak geser (membuka 2 tombol: 75*2 = 150)
                disableRightSwipe={true} // Hanya geser ke kiri
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.taskList}
              />
            )}
          </View>
        </View>

        {/* BOTTOM BAR & FAB */}
        <View style={styles.bottomBar}>
          <TouchableOpacity>
            <Icon name="home" size={30} color="#5A31F4" />
          </TouchableOpacity>
          <View style={styles.fabSpacer} />
          <TouchableOpacity>
            <Icon name="account-group-outline" size={30} color="#999" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
          <Icon name="plus" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        
      </SafeAreaView>

      {/* PANGGIL KOMPONEN MODAL */}
      <AddTaskModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={newTaskTitle}
        onTitleChange={setNewTaskTitle}
        category={newTaskCategory}
        onCategorySelect={setNewTaskCategory as (category: string) => void}
        onSave={addTask}
      />
    </>
  );
};

const { width } = Dimensions.get('window');

// --- STYLES (Penambahan Style Swipe) ---

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F8F9FE' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },

  categoryContainer: { paddingVertical: 10, paddingLeft: 20 },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryChipActive: { backgroundColor: '#5A31F4', borderColor: '#5A31F4' },
  categoryChipInactive: { backgroundColor: '#F3F0FF', borderColor: '#F3F0FF' },
  categoryText: { fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  categoryTextInactive: { color: '#5A31F4' },

  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    zIndex: 999,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dropdownTriggerText: { fontSize: 16, fontWeight: '600', color: '#5A31F4' },

  dropdownMenu: {
    position: 'absolute',
    top: 58, 
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: { fontSize: 15, color: '#333' },
  dropdownItemTextActive: { color: '#5A31F4', fontWeight: 'bold' },

  listContainer: {
    flex: 1,
    zIndex: 1,
  },
  // --- STYLE SWIPE BARU ---
  rowBack: {
      alignItems: 'center',
      backgroundColor: '#F8F9FE', // Sama dengan background container
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end', // Posisikan tombol di kanan
      paddingHorizontal: 20,
      marginVertical: 8, // Sesuaikan dengan margin taskCard
      borderRadius: 16,
  },
  backBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 70,
      height: '100%', // Ambil tinggi container rowBack
      marginRight: 0,
      borderRadius: 12,
      paddingTop: 8,
  },
  backBtnEdit: {
      backgroundColor: '#34AADC', // Biru untuk Edit
      marginLeft: 5,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
  },
  backBtnDelete: {
      backgroundColor: '#FF3B30', // Merah untuk Hapus
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
  },
  backBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4,
  },
  // -------------------------
  taskList: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    elevation: 2,
  },
  taskCardCompleted: { backgroundColor: '#F5F5F5', opacity: 0.8 },
  checkbox: { marginRight: 15, marginTop: 2 },

  taskTextContainer: { 
    flex: 1,
    marginRight: 10,
  },
  taskProject: { fontSize: 13, color: '#888' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  taskTextCompleted: { textDecorationLine: 'line-through', color: '#AAA' },
  taskDueDate: { fontSize: 12, color: '#666', marginTop: 6, fontWeight: '500' },
  
  priorityTag: { 
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start', 
  },
  
  priorityTagText: {
    fontWeight: '600',
    fontSize: 12,
  },
  priorityHigh: { backgroundColor: '#FFE5E7' },
  priorityTextHigh: { color: '#D62839' },
  priorityMedium: { backgroundColor: '#FFF1D6' },
  priorityTextMedium: { color: '#F4A300' },
  priorityLow: { backgroundColor: '#E4EDFF' },
  priorityTextLow: { color: '#2F6FED' },

  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 16 },
  emptyStateSubText: { fontSize: 14, color: '#888', textAlign: 'center' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    zIndex: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5A31F4',
    zIndex: 101,
    shadowColor: '#5A31F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabSpacer: { width: 60 },
});

export default Home;
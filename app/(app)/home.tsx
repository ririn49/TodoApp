import React, { useState, useMemo, useEffect } from 'react'; // Tambahkan useEffect
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal, 
  TextInput,
  Alert, 
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view'; 
import AddTaskModal from './AddTaskModal'; 

// --- 1. IMPORT FIREBASE BARU ---
// 🔥 PERBAIKAN IMPORT PATH: Menggunakan path yang lebih aman
import { db, auth } from '../../config/firebaseConfig'; 
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'; 
// ----------------------------

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

// 🔥 Hapus Data Dummy (INITIAL_TASKS) dan variabel penunjang
const today = new Date(); // Pertahankan hanya untuk inisialisasi date state

// --- FUNGSI HELPER (SAMA) ---

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

// --- KOMPONEN CHILD (SAMA) ---

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
  const [tasks, setTasks] = useState<Task[]>([]); 
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
            // TODO: Update completed status di Firestore
            return { ...task, completedAt: new Date().toISOString() };
          }
          return { ...task, completedAt: null };
        }
        return task;
      })
    );
  };
  
  // --- FUNGSI HAPUS DAN EDIT BARU (SAMA) ---
  
  const handleDeleteConfirmed = (id: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
    // TODO: Hapus dokumen dari Firestore
  };
  
  const deleteTask = (id: string) => { /* ... SAMA ... */
      const taskToActOn = tasks.find(t => t.id === id);

      if (taskToActOn && taskToActOn.completedAt) {
          Alert.alert("Tugas Selesai", "Tugas yang sudah selesai tidak dapat dihapus atau diedit.");
          return;
      }
      
      Alert.alert(
          "Konfirmasi Hapus",
          "Apakah Anda yakin ingin menghapus tugas ini?",
          [
              { text: "Tidak", style: "cancel" },
              { text: "Ya", onPress: () => handleDeleteConfirmed(id), style: "destructive" }
          ],
          { cancelable: true }
      );
  };

  const editTask = (id: string) => { /* ... SAMA ... */
      const taskToActOn = tasks.find(t => t.id === id);

      if (taskToActOn && taskToActOn.completedAt) {
          Alert.alert("Tugas Selesai", "Tugas yang sudah selesai tidak dapat dihapus atau diedit.");
          return;
      }
      
      alert(`Membuka modal untuk Edit Tugas dengan ID: ${id}`);
  };
  // ------------------------------------------

  // --- 🔥 PERBAIKAN UTAMA: FUNGSI ADDTASK DENGAN FIREBASE LOGIC ---
  const addTask = async ( // Tambahkan 'async'
      title: string, 
      category: CategoryLiteral, 
      priority: TaskPriority, 
      dueDate: string, 
      description: string 
  ) => {
      // 1. VALIDASI USER
      const user = auth.currentUser;
      
      if (!user) {
          Alert.alert("Error", "Anda harus login untuk menyimpan tugas.");
          return;
      }
      if (title.trim() === '') {
          Alert.alert('Error', 'Data harus diisi semua');
          return;
      }

      const newId = (Math.random().toString(36).substring(2, 9) + Date.now()).toString();

      const newTask: Task = {
          id: newId,
          project: category, // Gunakan kategori sebagai project
          title: title, 
          priority: priority, 
          completedAt: null,
          category: category, 
          dueDate: dueDate, 
      };

      // 2. SIMPAN KE FIREBASE
      try {
          await addDoc(collection(db, "todos"), {
              ...newTask,
              description: description,
              createdAt: serverTimestamp(),
              userId: user.uid, // GUNAKAN UID ASLI PENGGUNA
          });
          
          console.log("Tugas berhasil disimpan ke Firestore.");

      } catch (e) {
          console.error("Error menambahkan dokumen: ", e);
          Alert.alert("Error", "Gagal menyimpan tugas ke database. Periksa koneksi atau aturan Firebase.");
          return; 
      }
      
      // 3. PERBARUI STATE LOKAL (Hanya jika Firebase berhasil)
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      
      // Reset state form setelah save
      setNewTaskTitle('');
      setNewTaskCategory(MOCK_CATEGORIES[0] as CategoryLiteral);
      setNewTaskDueDate(today.toISOString());
      setNewTaskPriority('Medium');
      setIsModalVisible(false);
  };
  // ----------------------------------------------------

  // --- 🔥 PERBAIKAN UTAMA: LOGIKA FETCH DENGAN onSnapshot ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
        console.warn("User belum login, tidak dapat mengambil data.");
        setTasks([]); 
        return;
    }

    const q = query(
        collection(db, "todos"), 
        where("userId", "==", user.uid), 
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            fetchedTasks.push({
                id: doc.id, 
                project: data.project,
                title: data.title,
                priority: data.priority,
                // Mengatasi potensi error jika field completedAt tidak ada
                completedAt: data.completedAt ? (data.completedAt.toDate ? data.completedAt.toDate().toISOString() : data.completedAt) : null, 
                category: data.category,
                dueDate: data.dueDate, 
            } as Task);
        });

        setTasks(fetchedTasks);
    }, (error) => {
        console.error("Error fetching tasks: ", error);
        Alert.alert("Error", "Gagal memuat daftar tugas dari server.");
    });

    return () => unsubscribe();
  }, []); // Array dependency kosong: Hanya berjalan sekali saat mount
  // ---------------------------------------------------------------------

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
    <> {/* FRAGMENT PEMBUNGKUS */}
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

          {/* --- SWIPE LIST VIEW DISINI --- */}
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
                    
                    {/* Tombol Edit (KUNING) */}
                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => item.completedAt ? null : editTask(item.id)} 
                      activeOpacity={item.completedAt ? 1.0 : 0.8}
                    >
                      <Text>
                        <Icon 
                        name="pencil-outline" 
                        size={30} 
                        color={item.completedAt ? '#AAA' : '#FFC300'} 
                      />
                      </Text>
                      
                    </TouchableOpacity>

                    {/* Tombol Hapus (MERAH) */}
                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => item.completedAt ? null : deleteTask(item.id)} 
                      activeOpacity={item.completedAt ? 1.0 : 0.8}
                    >
                      <Icon 
                        name="delete-outline" 
                        size={30} 
                        color={item.completedAt ? '#AAA' : '#FF3B30'} 
                      />
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
        
        // --- PROPS TAMBAHAN UNTUK MODAL ---
        priority={newTaskPriority}
        onPrioritySelect={setNewTaskPriority as (priority: TaskPriority) => void}
        dueDate={newTaskDueDate}
        onDueDateChange={setNewTaskDueDate}
        
        onSave={addTask} // onSave sekarang menerima 5 parameter
      />
    </>
  );
};

const { width } = Dimensions.get('window');

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F8F9FE' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30, // Jarak atas
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
  // --- STYLE SWIPE (Sudah FIX) ---
  rowBack: {
      alignItems: 'center',
      backgroundColor: '#F8F9FE', 
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginHorizontal: -20, 
      marginVertical: 8, 
      borderRadius: 16,
      overflow: 'hidden', 
      paddingRight: 20, 
  },
  backBtn: {
      backgroundColor: 'transparent', 
      alignItems: 'center',
      justifyContent: 'center',
      width: 60, 
      height: '100%', 
      paddingHorizontal: 10, 
  },
  backBtnEdit: {
      // Background transparan
  },
  backBtnDelete: {
      // Background transparan
  },
  backBtnText: {
      color: '#FFFFFF', 
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4,
  },
  // ----------------------------------------
  // FIX: Mengubah marginHorizontal di taskCard menjadi 0 agar sejajar
  taskList: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 0, // FIX: Dihapus margin horizontal yang menyebabkan card bergeser
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    elevation: 2,
    zIndex: 10, 
  },
  taskCardCompleted: { backgroundColor: '#F5F5F5', opacity: 1 }, 
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
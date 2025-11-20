// AddTaskModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Definisikan tipe lokal (HARUS SAMA dengan home.tsx)
type CategoryLiteral = 'Work' | 'Daily' | 'Vacation' | 'Me time' | 'Health';
type TaskPriority = 'High' | 'Medium' | 'Low'; 

const MOCK_CATEGORIES: CategoryLiteral[] = ['Work', 'Daily', 'Vacation', 'Me time', 'Health'];
const MOCK_PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low']; 
const MAX_TITLE_LENGTH = 20;

// --- FUNGSI HELPER TANGGAL ---
const formatDisplayDate = (isoDate: string): string => {
    try {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return "Pilih Tanggal"; 
        
        const today = new Date();
        const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (dateStart.getTime() === todayStart.getTime()) {
            return 'Hari ini'; 
        }

        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    } catch (e) {
        return "Pilih Tanggal";
    }
};
// -----------------------------


interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (title: string, category: CategoryLiteral, priority: TaskPriority, dueDate: string, description: string) => void; 

  // State values
  title: string;
  category: CategoryLiteral;
  priority: TaskPriority;
  dueDate: string;

  // State setters
  onTitleChange: (text: string) => void;
  onCategorySelect: (category: CategoryLiteral) => void; 
  onPrioritySelect: (priority: TaskPriority) => void; 
  onDueDateChange: (date: string) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isVisible,
  onClose,
  onSave,
  title,
  onTitleChange,
  category,
  onCategorySelect,
  priority,
  onPrioritySelect,
  dueDate,
  onDueDateChange,
}) => {
  const [description, setDescription] = useState(''); 
  const [showCategoryPicker, setShowCategoryPicker] = useState(false); 
  const [showPriorityPicker, setShowPriorityPicker] = useState(false); 
  const [showDatePicker, setShowDatePicker] = useState(false); 

  const handleSave = () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'Data harus diisi semua');
      return;
    }
    onSave(title, category, priority, dueDate, description);
    
    setDescription('');
    setShowCategoryPicker(false);
    setShowPriorityPicker(false);
  };

  const handleTitleChange = (text: string) => {
    if (text.length <= MAX_TITLE_LENGTH) {
        onTitleChange(text);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date(dueDate);
    
    if (Platform.OS !== 'ios') {
        setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
        onDueDateChange(currentDate.toISOString());
    }
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            
            {/* HEADER MODAL */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <Icon name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Buat Tugas</Text>
              <View style={{ width: 24 }} /> {/* Spacer */}
            </View>

            {/* FORM: KATEGORI (Aktif) */}
            <View style={styles.cardContainer}>
                <Text style={styles.label}>Kategori</Text>
                <TouchableOpacity 
                    style={styles.dropdownInput} 
                    onPress={() => {
                        setShowCategoryPicker(p => !p); 
                        setShowPriorityPicker(false); 
                        setShowDatePicker(false); 
                    }} 
                >
                    <Text style={styles.dropdownText}>{category}</Text>
                    <Icon name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
                
                {showCategoryPicker && (
                    <View style={styles.inlinePickerContainer}>
                        {MOCK_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.chip, category === cat && styles.chipActive]}
                                onPress={() => {
                                    onCategorySelect(cat);
                                    setShowCategoryPicker(false);
                                }}
                            >
                                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* FORM: JENIS TUGAS / PRIORITAS (Aktif) */}
            <View style={styles.cardContainer}>
                <Text style={styles.label}>Jenis Tugas</Text>
                <TouchableOpacity 
                    style={styles.dropdownInput} 
                    onPress={() => {
                        setShowPriorityPicker(p => !p); 
                        setShowCategoryPicker(false); 
                        setShowDatePicker(false); 
                    }} 
                >
                    <Text style={styles.dropdownText}>
                        {priority} 
                    </Text>
                    <Icon name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
                
                {showPriorityPicker && (
                    <View style={styles.inlinePickerContainer}>
                        {MOCK_PRIORITIES.map((prio) => (
                            <TouchableOpacity
                                key={prio}
                                style={[styles.chip, priority === prio && styles.chipActive]}
                                onPress={() => {
                                    onPrioritySelect(prio);
                                    setShowPriorityPicker(false); 
                                }}
                            >
                                <Text style={[styles.chipText, priority === prio && styles.chipTextActive]}>{prio}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
            
            {/* FORM: NAMA TUGAS (Dengan Counter) */}
            <View style={styles.cardContainer}>
                <Text style={styles.label}>Nama Tugas</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Market Research"
                    value={title}
                    onChangeText={handleTitleChange} 
                />
                <Text style={styles.counterText}>
                    {title.length}/{MAX_TITLE_LENGTH}
                </Text>
            </View>

            {/* FORM: TANGGAL (Aktif) */}
            <View style={styles.cardContainer}>
                <Text style={styles.label}>Tanggal</Text>
                <TouchableOpacity 
                    style={styles.datePickerButton} 
                    onPress={() => {
                        setShowDatePicker(true);      
                        setShowCategoryPicker(false); 
                        setShowPriorityPicker(false); 
                    }}
                >
                    <Text style={styles.datePickerText}>{formatDisplayDate(dueDate)}</Text>
                    <Icon name="calendar-month" size={20} color="#555" />
                </TouchableOpacity>
            </View>

            {/* --- DATE TIME PICKER UTAMA --- */}
            {showDatePicker && (
                <DateTimePicker
                    value={new Date(dueDate)} 
                    mode={'date'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}
            {/* --------------------------------- */}

            {/* FORM: DESKRIPSI (SAMA) */}
            <View style={[styles.cardContainer, { height: 150 }]}>
                <Text style={styles.label}>Deskripsi</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Tulis deskripsi tugas Anda di sini..."
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    textAlignVertical="top"
                />
            </View>
          </ScrollView>

          {/* TOMBOL SAVE */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Tambah Tugas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};


// --- STYLES MODAL ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    paddingVertical: 5,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  counterText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  // --- STYLE PICKER INLINE BARU ---
  inlinePickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: {
    backgroundColor: '#5A31F4',
    borderColor: '#5A31F4',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // ---------------------------------
  saveButton: {
    backgroundColor: '#5A31F4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTaskModal;
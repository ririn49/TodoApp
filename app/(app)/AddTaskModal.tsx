import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// MOCK_CATEGORIES perlu diimpor atau didefinisikan ulang jika file ini terpisah
// ASUMSI: Anda sudah memiliki akses ke MOCK_CATEGORIES
const MOCK_CATEGORIES: string[] = ['Work', 'Daily', 'Vacation', 'Me time', 'Health'];


interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (text: string) => void;
  category: string;
  onCategorySelect: (category: string) => void; 
  onSave: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isVisible,
  onClose,
  title,
  onTitleChange,
  category,
  onCategorySelect,
  onSave,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>Buat Tugas Baru</Text>

          {/* Input Judul */}
          <TextInput
            style={modalStyles.input}
            placeholder="Judul Tugas (ex: Beli kebutuhan dapur)"
            value={title}
            onChangeText={onTitleChange}
            placeholderTextColor="#8A7DAB"
          />
          
          {/* Pemilih Kategori (Horizontal Scroll) */}
          <View style={modalStyles.categorySelector}>
            {/* PASTIKAN TEXT DIBAWAH INI DIBUNGKUS TEXT */}
            <Text style={modalStyles.label}>Kategori:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOCK_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    modalStyles.categoryChip,
                    category === cat ? modalStyles.categoryChipActive : modalStyles.categoryChipInactive,
                  ]}
                  onPress={() => onCategorySelect(cat)}
                >
                  <Text style={[modalStyles.categoryText, category === cat && {color: 'white'}]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Tombol Aksi */}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity style={modalStyles.buttonCancel} onPress={onClose}>
              <Text style={modalStyles.textCancel}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.buttonSave} onPress={onSave}>
              <Text style={modalStyles.textSave}>Simpan Tugas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLES MODAL ---
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  categorySelector: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryChipActive: { backgroundColor: '#5A31F4', borderColor: '#5A31F4' },
  categoryChipInactive: { backgroundColor: '#E0E0E0', borderColor: '#E0E0E0' },
  categoryText: { fontSize: 14, fontWeight: '600', color: 'black' },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonCancel: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
    alignItems: 'center',
  },
  textCancel: {
    color: '#555',
    fontWeight: 'bold',
  },
  buttonSave: {
    flex: 1.5,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#5A31F4',
    alignItems: 'center',
  },
  textSave: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddTaskModal;
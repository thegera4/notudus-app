import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Strings } from '@/constants/Strings'
import { ModelDownloaderProps } from '@/types'

export default function ModelDownloader({
  progress,
  status,
  onStartDownload,
  errorMessage,
}: ModelDownloaderProps) {
  const isDownloading = status === 'downloading'
  const isError = status === 'error'

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="hardware-chip-outline" size={44} color="#66bb6a" />
        </View>

        <Text style={styles.title}>{Strings.ASSISTANT.MODEL_TITLE}</Text>
        <Text style={styles.description}>{Strings.ASSISTANT.MODEL_DESC}</Text>

        <View style={styles.specsContainer}>
          <View style={styles.specRow}>
            <Ionicons name="shield-checkmark" size={18} color="#66bb6a" />
            <Text style={styles.specText}>100% Offline (Tus notas no salen del celular)</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="calculator-outline" size={18} color="#66bb6a" />
            <Text style={styles.specText}>Capaz de sumar deudas y extraer credenciales</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="cloud-download-outline" size={18} color="#66bb6a" />
            <Text style={styles.specText}>Descarga única (~950 MB)</Text>
          </View>
        </View>

        {isDownloading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>{Strings.ASSISTANT.DOWNLOADING}</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <ActivityIndicator size="small" color="#66bb6a" style={styles.spinner} />
          </View>
        )}

        {isError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef5350" />
            <Text style={styles.errorText}>
              {errorMessage || Strings.ASSISTANT.DOWNLOAD_ERROR}
            </Text>
          </View>
        )}

        {!isDownloading && (
          <TouchableOpacity
            style={styles.downloadButton}
            activeOpacity={0.8}
            onPress={onStartDownload}
          >
            <Ionicons name="download" size={20} color="#ffffff" style={styles.btnIcon} />
            <Text style={styles.downloadButtonText}>
              {isError ? Strings.ASSISTANT.RETRY : Strings.ASSISTANT.DOWNLOAD_BTN}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  card: {
    width: '100%',
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#303030',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(102, 187, 106, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#b0b0b0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  specsContainer: {
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  specText: {
    color: '#e0e0e0',
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },
  progressContainer: {
    width: '100%',
    marginVertical: 14,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#303030',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#66bb6a',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    color: '#b0b0b0',
    fontSize: 13,
  },
  progressPercent: {
    color: '#66bb6a',
    fontSize: 13,
    fontWeight: 'bold',
  },
  spinner: {
    marginTop: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#ef5350',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    elevation: 4,
  },
  btnIcon: {
    marginRight: 8,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

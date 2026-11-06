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
import { AIModelId, ModelDownloaderProps } from '@/types'

const LEGACY_MODELS: Record<
  AIModelId,
  { name: string; badge: string; description: string }
> = {
  light: {
    name: 'Qwen 2.5 (1.5B)',
    badge: '~950 MB • Rápido y ligero',
    description: 'Ideal para consultas rápidas con menor uso de batería y RAM.',
  },
  advanced: {
    name: 'Qwen 2.5 (3B)',
    badge: '~1.93 GB • Mayor precisión',
    description: 'Mejor razonamiento en cuentas complejas y notas extensas.',
  },
}

export default function ModelDownloader({
  progress,
  status,
  onStartDownload,
  errorMessage,
  selectedModel = 'light',
  onSelectModel,
}: ModelDownloaderProps) {
  const isDownloading = status === 'downloading'
  const isError = status === 'error'
  const activeConfig = LEGACY_MODELS[selectedModel] || LEGACY_MODELS.light

  const modelOptions: AIModelId[] = ['light', 'advanced']

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="hardware-chip-outline" size={44} color="#66bb6a" />
        </View>

        <Text style={styles.title}>{Strings.ASSISTANT.MODEL_TITLE}</Text>
        <Text style={styles.description}>{Strings.ASSISTANT.MODEL_DESC}</Text>

        {/* Model Selector (Ligero vs Avanzado) */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorHeader}>Selecciona el modelo a utilizar:</Text>
          <View style={styles.selectorRow}>
            {modelOptions.map((modelId) => {
              const cfg = LEGACY_MODELS[modelId]
              const isSelected = selectedModel === modelId
              return (
                <TouchableOpacity
                  key={modelId}
                  style={[
                    styles.modelOptionCard,
                    isSelected && styles.modelOptionCardSelected,
                  ]}
                  activeOpacity={0.8}
                  disabled={isDownloading}
                  onPress={() => onSelectModel && onSelectModel(modelId)}
                >
                  <View style={styles.modelOptionHeader}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#66bb6a' : '#888888'}
                    />
                    <Text
                      style={[
                        styles.modelOptionTitle,
                        isSelected && styles.modelOptionTitleSelected,
                      ]}
                    >
                      {modelId === 'light' ? 'Ligero (1.5B)' : 'Avanzado (3B)'}
                    </Text>
                  </View>
                  <Text style={styles.modelOptionBadge}>{cfg.badge}</Text>
                  <Text style={styles.modelOptionDesc}>{cfg.description}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.specsContainer}>
          <View style={styles.specRow}>
            <Ionicons name="shield-checkmark" size={18} color="#66bb6a" />
            <Text style={styles.specText}>100% Offline (Tus notas no salen del celular)</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="calculator-outline" size={18} color="#66bb6a" />
            <Text style={styles.specText}>Suma préstamos, resta abonos y extrae claves</Text>
          </View>
          <View style={styles.specRow}>
            <Ionicons name="cloud-download-outline" size={18} color="#66bb6a" />
            <Text style={styles.specText}>
              Descarga única ({activeConfig.name} • {activeConfig.badge.split('•')[0].trim()})
            </Text>
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
              {isError
                ? Strings.ASSISTANT.RETRY
                : selectedModel === 'advanced'
                ? Strings.ASSISTANT.DOWNLOAD_ADVANCED_BTN
                : Strings.ASSISTANT.DOWNLOAD_BTN}
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
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#303030',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(102, 187, 106, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: '#b0b0b0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  selectorContainer: {
    width: '100%',
    marginBottom: 16,
  },
  selectorHeader: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modelOptionCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  modelOptionCardSelected: {
    borderColor: '#66bb6a',
    backgroundColor: 'rgba(102, 187, 106, 0.08)',
  },
  modelOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelOptionTitle: {
    color: '#cccccc',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  modelOptionTitleSelected: {
    color: '#ffffff',
  },
  modelOptionBadge: {
    color: '#66bb6a',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  modelOptionDesc: {
    color: '#9e9e9e',
    fontSize: 11,
    lineHeight: 15,
  },
  specsContainer: {
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  specText: {
    color: '#e0e0e0',
    fontSize: 12,
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
    fontSize: 15,
    fontWeight: 'bold',
  },
})

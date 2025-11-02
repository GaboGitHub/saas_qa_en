import { EventType, EventSeverity } from './enums';

/**
 * This file contains constant values that are used across the test suite.
 * This includes UI copy text, messages, and reusable test data.
 */

export const pageCopy = {
    appTitle: '🎯 SekiOS Event Manager',
    appSubtitle: 'Gestionnaire d\'événements de sécurité',
    createEventHeading: '➕ Créer un événement',
    eventListHeading: '📋 Liste des événements',
    successToast: '✅ Événement créé avec succès!',
    deleteSuccessToast: '🗑️ Événement supprimé',
    deleteModalTitle: '⚠️ Confirmer la suppression',
    deleteModalBodyText: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
    deleteModalWarningText: '⚠️ Cette action est irréversible.',
    viewModalTitle: '📋 Détails de l\'événement',
};

export const buttonCopy = {
    cancel: 'Annuler',
    delete: '🗑️ Supprimer',
    close: 'Fermer',
    view: '👁️ Voir',
};

export const testEvents = {
    successEvent: {
        title: 'Successful Login',
        type: EventType.SUCCESS,
        source: 'Auth-Service',
        severity: EventSeverity.LOW,
        description: 'User admin@sekoia.io logged in successfully'
    },
    warningEvent: {
        title: 'Suspicious Login Attempt',
        type: EventType.WARNING,
        source: 'Firewall',
        severity: EventSeverity.MEDIUM,
        description: 'A login attempt from an unrecognized IP has been blocked.'
    },
    errorEvent: {
        title: 'Database Error',
        type: EventType.ERROR,
        source: 'Database',
        severity: EventSeverity.HIGH,
        description: 'The database service is not responding.'
    },
    infoEvent: {
        title: 'System Update',
        type: EventType.INFO,
        source: 'System',
        severity: EventSeverity.LOW,
        description: 'A system update is scheduled for 2 AM.'
    },
    criticalEvent: {
        title: 'Critical System Failure',
        type: EventType.ERROR,
        source: 'Kernel',
        severity: EventSeverity.CRITICAL,
        description: 'A critical kernel panic was reported.'
    }
};

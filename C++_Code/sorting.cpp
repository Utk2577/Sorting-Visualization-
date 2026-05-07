#include <iostream>
using namespace std;

// ─────────────────────────────────────────
//  INSERTION SORT
// ─────────────────────────────────────────
void insertionSort(int arr[], int n, int &comps, int &swaps) {
    comps = swaps = 0;
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
            comps++; swaps++;
        }
        comps++;
        arr[j + 1] = key;
    }
}

// ─────────────────────────────────────────
//  QUICK SORT
// ─────────────────────────────────────────
void quickSort(int arr[], int low, int high, int &comps, int &swaps) {
    if (low >= high) return;

    int pivot = arr[high], i = low - 1;
    for (int j = low; j < high; j++) {
        comps++;
        if (arr[j] <= pivot) {
            swap(arr[++i], arr[j]);
            swaps++;
        }
    }
    swap(arr[i + 1], arr[high]);
    swaps++;
    int pi = i + 1;

    quickSort(arr, low, pi - 1, comps, swaps);
    quickSort(arr, pi + 1, high, comps, swaps);
}

// ─────────────────────────────────────────
//  MERGE SORT
// ─────────────────────────────────────────
void merge(int arr[], int l, int m, int r, int &comps, int &swaps) {
    int left[m - l + 1], right[r - m];
    for (int i = 0; i <= m - l; i++) left[i] = arr[l + i];
    for (int i = 0; i < r - m; i++) right[i] = arr[m + 1 + i];

    int i = 0, j = 0, k = l;
    while (i < m - l + 1 && j < r - m) {
        comps++;
        arr[k++] = (left[i] <= right[j]) ? left[i++] : (swaps++, right[j++]);
    }
    while (i < m - l + 1) arr[k++] = left[i++];
    while (j < r - m)     arr[k++] = right[j++];
}

void mergeSort(int arr[], int l, int r, int &comps, int &swaps) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m, comps, swaps);
    mergeSort(arr, m + 1, r, comps, swaps);
    merge(arr, l, m, r, comps, swaps);
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
void printArray(int arr[], int n) {
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
}

void copyArray(int src[], int dst[], int n) {
    for (int i = 0; i < n; i++) dst[i] = src[i];
}

// ─────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────
int main() {
    int original[] = {64, 34, 25, 12, 22, 11, 90};
    int n = 7, arr[7], comps, swaps;

    // Run each sort on a fresh copy
    auto run = [&](string name, auto sortFn) {
        copyArray(original, arr, n);
        cout << "=============================\n";
        cout << "Algorithm : " << name << "\nBefore    : "; printArray(arr, n);
        sortFn(arr, comps, swaps);
        cout << "After     : "; printArray(arr, n);
        cout << "Comparisons : " << comps << "\nSwaps       : " << swaps << "\n\n";
    };

    run("Insertion Sort", [&](int a[], int &c, int &s) { insertionSort(a, n, c, s); });
    run("Quick Sort",     [&](int a[], int &c, int &s) { quickSort(a, 0, n-1, c, s); });
    run("Merge Sort",     [&](int a[], int &c, int &s) { mergeSort(a, 0, n-1, c, s); });

    return 0;
}
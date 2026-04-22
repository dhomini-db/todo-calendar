package com.todocalendar.service;

import com.todocalendar.entity.Task;
import com.todocalendar.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Gera arquivos de exportação dos dados do usuário.
 *
 * <h3>CSV de tarefas</h3>
 * Inclui BOM UTF-8 (0xEF 0xBB 0xBF) para compatibilidade com Excel no Windows.
 * Campos com vírgula ou aspas são escapados seguindo RFC 4180.
 * Colunas: Data, Título, Descrição, Tipo, Concluída, Criada em.
 */
@Service
@RequiredArgsConstructor
public class ExportService {

    private final TaskRepository taskRepository;

    private static final DateTimeFormatter DATE_FMT     = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generateTasksCsv(Long userId) {
        List<Task> tasks = taskRepository.findAllForExport(userId);

        StringBuilder sb = new StringBuilder();

        // Header
        sb.append("Data,Título,Descrição,Tipo,Concluída,Criada em\n");

        for (Task t : tasks) {
            sb.append(csv(t.getDate() != null ? t.getDate().format(DATE_FMT) : ""))
              .append(',')
              .append(csv(t.getTitle()))
              .append(',')
              .append(csv(t.getDescription() != null ? t.getDescription() : ""))
              .append(',')
              .append(csv(t.getType() != null ? (t.getType().name().equals("POSITIVE") ? "Positiva" : "Negativa") : ""))
              .append(',')
              .append(t.isCompleted() && t.isInteracted() ? "Sim" : "Não")
              .append(',')
              .append(csv(t.getCreatedAt() != null ? t.getCreatedAt().format(DATETIME_FMT) : ""))
              .append('\n');
        }

        // Prepend UTF-8 BOM so Excel opens correctly
        byte[] bom  = new byte[]{ (byte)0xEF, (byte)0xBB, (byte)0xBF };
        byte[] body = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] out  = new byte[bom.length + body.length];
        System.arraycopy(bom,  0, out, 0,           bom.length);
        System.arraycopy(body, 0, out, bom.length,  body.length);
        return out;
    }

    /** Envolve valor em aspas duplas e escapa aspas internas (RFC 4180). */
    private String csv(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}
